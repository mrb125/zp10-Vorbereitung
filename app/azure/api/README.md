# ZP10 Azure Functions API

Backend-API für die ZP10 Mathe-Diagnose-Plattform. Diese Azure Functions stellen die REST-Schnittstellen bereit für:

- Speicherung von Testergebnissen
- Abruf von Schülerdaten
- Klassenverwaltung
- Berechnung von Statistiken

## Architecture

```
Azure Functions (Node.js)
    ↓
Cosmos DB (Document Database)
    ↓
Azure AD (Authentifizierung)
```

## API Endpoints

### 1. Ergebnis speichern

**POST** `/api/results/{moduleId}`

Speichert ein Testergebnis für einen Schüler in einem Modul.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "moduleId": "terme-gleichungen",
  "userId": "user-uuid",
  "studentId": "student-uuid",
  "score": 75,
  "maxScore": 100,
  "answers": {
    "q1": "a",
    "q2": "b",
    ...
  },
  "timestamp": "2024-03-28T10:30:00Z",
  "timeSpent": 1200,
  "misconceptions": [
    "MV001",
    "MV002"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "resultId": "result-uuid",
  "timestamp": "2024-03-28T10:30:00Z",
  "synced": true
}
```

**Fehler:**
- 400: Ungültige Anfrage
- 401: Nicht authentifiziert
- 409: Duplikat (Ergebnis existiert bereits)
- 500: Serverfehler

---

### 2. Alle Ergebnisse eines Schülers abrufen

**GET** `/api/results/{studentId}`

Ruft alle Testergebnisse für einen bestimmten Schüler ab.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameter:**
- `moduleId` (optional): Nur Ergebnisse eines Moduls
- `from` (optional): Ab Datum (ISO 8601)
- `to` (optional): Bis Datum (ISO 8601)

**Response (200):**
```json
{
  "studentId": "student-uuid",
  "studentName": "Max Mustermann",
  "results": [
    {
      "resultId": "result-uuid",
      "moduleId": "terme-gleichungen",
      "score": 75,
      "maxScore": 100,
      "timestamp": "2024-03-28T10:30:00Z",
      "misconceptions": ["MV001"]
    },
    ...
  ],
  "summary": {
    "totalTests": 5,
    "averageScore": 72,
    "medianScore": 75
  }
}
```

---

### 3. Klassenergebnisse abrufen

**GET** `/api/class/{classId}/results`

Ruft alle Testergebnisse für eine ganze Klasse ab.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameter:**
- `moduleId` (optional): Nur ein Modul
- `week` (optional): Nur letzte N Wochen

**Response (200):**
```json
{
  "classId": "class-uuid",
  "className": "10a",
  "results": [
    {
      "studentId": "student-uuid",
      "studentName": "Max Mustermann",
      "moduleId": "terme-gleichungen",
      "score": 75,
      "timestamp": "2024-03-28T10:30:00Z"
    },
    ...
  ],
  "statistics": {
    "studentCount": 24,
    "averageScore": 68,
    "medianScore": 70,
    "distribution": {
      "excellent": 4,
      "good": 8,
      "medium": 8,
      "low": 4
    }
  }
}
```

---

### 4. Schülerliste einer Klasse

**GET** `/api/class/{classId}/students`

Ruft die Schülerliste einer Klasse ab (aus Azure AD oder lokaler DB).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "classId": "class-uuid",
  "className": "10a",
  "students": [
    {
      "studentId": "student-uuid",
      "displayName": "Max Mustermann",
      "email": "max.mustermann@school.de",
      "userId": "user-uuid",
      "status": "active"
    },
    ...
  ],
  "total": 24,
  "source": "azure-ad" // oder "local"
}
```

---

## Cosmos DB Schema

Die Daten werden in zwei Containernen gespeichert:

### Container: `results`
```json
{
  "id": "result-uuid",
  "partitionKey": "student-uuid",
  "moduleId": "terme-gleichungen",
  "studentId": "student-uuid",
  "userId": "teacher-uuid",
  "classId": "class-uuid",
  "score": 75,
  "maxScore": 100,
  "timestamp": "2024-03-28T10:30:00Z",
  "answers": {...},
  "misconceptions": ["MV001"],
  "ttl": 7776000 // 90 Tage
}
```

### Container: `students`
```json
{
  "id": "student-uuid",
  "partitionKey": "class-uuid",
  "displayName": "Max Mustermann",
  "email": "max.mustermann@school.de",
  "classId": "class-uuid",
  "userId": "azure-ad-id",
  "status": "active",
  "created": "2024-01-15T10:00:00Z"
}
```

---

## Authentication

Alle Endpoints erfordern ein gültiges Azure AD Bearer Token.

**Token erhalten:**

```javascript
// Im Frontend (MSAL)
const token = await ZP10Sync._getToken();
```

**Backend-Validierung:**

```javascript
// In der Azure Function
const verifyToken = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token');

  const decoded = jwt.verify(token, publicKey);
  return decoded;
};
```

---

## DSGVO und Datenschutz

- **Datenspeicherung**: Nur in Cosmos DB (EU-Region: Frankfurt)
- **Verschlüsselung**: TLS in Transit, verschlüsselt in Azure Storage
- **Retention**: 90 Tage (TTL auf Cosmos DB Dokumenten)
- **Audit**: Alle Zugiffe werden geloggt in Azure Application Insights
- **Löschung**: GDPR-Konform möglich via `/api/student/{studentId}/delete`

---

## Environment Variables

Für die Azure Function App erforderlich:

```env
COSMOS_CONNECTION_STRING=AccountEndpoint=https://...
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
GRAPH_API_KEY=...
```

---

## Deployment

### 1. Lokal testen

```bash
npm install
func start
```

Erreichbar unter `http://localhost:7071`

### 2. In Azure deployen

```bash
# Einmalig: Neue Function App erstellen
az functionapp create \
  --resource-group zp10-rg \
  --consumption-plan-location northeurope \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name zp10-api

# Deployen
npm run deploy
```

### 3. Konfiguration

Alle Umgebungsvariablen in der Azure Portal setzen:

1. Function App → Configuration → Application settings
2. Jede Variable einzeln eintragen
3. Save

---

## Stub Implementierungen

Derzeit sind die folgenden Funktionen nur als Stubs implementiert:

- `results.js` - POST /api/results/{moduleId}
- `getResults.js` - GET /api/results/{studentId}
- `classResults.js` - GET /api/class/{classId}/results
- `classStudents.js` - GET /api/class/{classId}/students

Diese müssen mit echtem Cosmos DB Code implementiert werden:

```javascript
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });
const database = client.database('zp10');
const resultsContainer = database.container('results');

// Dokumentspeichern
const { resource: createdItem } = await resultsContainer.items.create(item);

// Dokumentabrufen
const { resources: items } = await resultsContainer.items
  .query("SELECT * FROM c WHERE c.studentId = @id", {
    parameters: [{ name: "@id", value: studentId }]
  })
  .fetchAll();
```

---

## Testing

```bash
npm test
```

Weitere Informationen zu Tests in `tests/` Ordner.

---

## Support

Bei Fragen oder Problemen:
- Dokumentation: https://learn.microsoft.com/de-de/azure/azure-functions/
- GitHub Issues: [Projektrepository]
- E-Mail: support@zp10.de

---

**Status:** 🟡 In Entwicklung

Diese Dokumentation wird laufend aktualisiert, wenn neue Features hinzugefügt werden.
