# Docker MongoDB Setup

## Prerequisites
- Docker Desktop installed and running

## Steps to Migrate

### 1. Start MongoDB Docker Container
```bash
docker-compose up -d
```

### 2. Verify MongoDB is Running
```bash
docker ps
```

### 3. Migrate Data from Atlas to Docker (Optional)
```bash
cd salon-platform
node migrate-data.js
```

### 4. Start Backend
```bash
cd backend
npm run dev
```

## MongoDB Connection Details
- **Host**: localhost
- **Port**: 27017
- **Database**: salonbook
- **Username**: salonbook_user
- **Password**: salonbook_password

## Docker Commands
- Start: `docker-compose up -d`
- Stop: `docker-compose down`
- View logs: `docker-compose logs -f mongodb`
- Access MongoDB shell: `docker exec -it salonbook-mongodb mongosh -u salonbook_user -p salonbook_password --authenticationDatabase salonbook`

## Backup & Restore
### Backup
```bash
docker exec salonbook-mongodb mongodump -u salonbook_user -p salonbook_password --authenticationDatabase salonbook --db salonbook --out /data/backup
docker cp salonbook-mongodb:/data/backup ./backup
```

### Restore
```bash
docker cp ./backup salonbook-mongodb:/data/backup
docker exec salonbook-mongodb mongorestore -u salonbook_user -p salonbook_password --authenticationDatabase salonbook --db salonbook /data/backup/salonbook
```
