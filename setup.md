# The Maybe Green Stuff - Setup

## Prerequisites
- Node.js
- npm or yarn

## Installation
1. Clone the repository
```bash
git clone https://github.com/abbindustrigymnasium/w-xter-s-themaybegreenstuff.git
cd w-xter-s-themaybegreenstuff
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

## Configuration
1. Create a `.dev.env` file in the root directory
2. Add the required environment variables:
```
# Database Configuration
DB_HOST = localhost
DB_PORT = 3306
DB_USER = default_user
DB_PASSWORD = default_password
DB_NAME = waxteras
TEMPHUM_DB_NAME = temp_hum

# AUTH PARAMS
JWT_SECRET_KEY = abcdef
PORT_AUTH = 3001
PORT_EMB = 3000

# Run in dbg mode
DEBUG = true
```

## Required mariadb setup:
# User Table:
```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `permission_level` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);
```
# Temperature and Humidity Table
```sql
CREATE TABLE `temp_hum` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `temp` float NOT NULL,
  `hum` float NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
);
```

## Running the Application
```bash
ts-node backend/data-manager/server.ts
```
## And:
```bash
cd quasar-project
quasar dev
```
