const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const db = require('./config/db');

// Configuración
const SALT_ROUNDS = 10;

// Función para generar fecha aleatoria alrededor de una fecha central
const getRandomDateAround = (centerDate, daysRange) => {
    const randomDays = (Math.random() * daysRange * 2) - daysRange;
    const date = new Date(centerDate);
    date.setDate(date.getDate() + randomDays);
    return date;
};

// Función para crear usuarios de prueba
const createTestUsers = async () => {
    const users = [
        {
            names: 'test',
            surnames: 'user',
            email: 'testUser@test.com',
            password: 'testPassword01',
            userType: 'Residencial',
            cedulaOrNit: 1987456321
        },
        {
            names: 'test2',
            surnames: 'user2',
            email: 'testUser2@test.com',
            password: 'testPassword02',
            userType: 'Residencial',
            cedulaOrNit: 1789456123
        }
    ];

    console.log('Creando usuarios de prueba...');

    for (const user of users) {
        // Verificar si el usuario ya existe
        const existingUser = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [user.email]);

        if (!existingUser) {
            const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
            await db.none(
                `INSERT INTO users (names, surnames, email, passwordHash, userType, cedulaOrNit)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [user.names, user.surnames, user.email, passwordHash, user.userType, user.cedulaOrNit]
            );
            console.log(`Usuario creado: ${user.email}`);
        } else {
            console.log(`Usuario ya existe: ${user.email}`);
        }
    }
};

// Función para generar datos falsos de consumo y producción
const generateFakeData = async () => {
    try {
        // Crear usuarios primero
        await createTestUsers();

        // Obtener IDs de usuarios de prueba
        const userIds = await db.many('SELECT id FROM users WHERE email IN ($1, $2)',
            ['testUser@test.com', 'testUser2@test.com']);

        // Fechas centrales para concentrar datos
        const centerDate1 = new Date('2025-01-22');
        const centerDate2 = new Date('2025-05-06');
        const daysRange = 3;

        // Datos para consumptions (50 registros)
        console.log('Generando 80 registros de consumo...');
        for (let i = 0; i < 80; i++) {
            const userIndex = Math.floor(Math.random() * userIds.length);
            const userId = userIds[userIndex].id;
            const consumptionValue = (Math.random() * (100 - 10) + 10).toFixed(2);

            const centerDate = i % 2 === 0 ? centerDate1 : centerDate2;
            const consumptionDate = getRandomDateAround(centerDate, daysRange);

            await db.none(
                `INSERT INTO consumptions (userId, consumptionValue, consumptionDate)
                 VALUES ($1, $2, $3)`,
                [userId, consumptionValue, consumptionDate]
            );
        }

        // Datos para productions (50 registros)
        console.log('Generando 80 registros de producción...');
        for (let i = 0; i < 80; i++) {
            const userIndex = Math.floor(Math.random() * userIds.length);
            const userId = userIds[userIndex].id;
            const productionValue = (Math.random() * (200 - 50) + 50).toFixed(2);

            const centerDate = i % 2 === 0 ? centerDate1 : centerDate2;
            const productionDate = getRandomDateAround(centerDate, daysRange);

            await db.none(
                `INSERT INTO productions (userId, productionValue, productionDate)
                 VALUES ($1, $2, $3)`,
                [userId, productionValue, productionDate]
            );
        }

        console.log('Datos insertados correctamente:');
        console.log('- 2 usuarios de prueba creados');
        console.log('- 50 registros de consumo');
        console.log('- 50 registros de producción');

    } catch (error) {
        console.error('Error al insertar datos:', error);
    } finally {
        pgp.end();
    }
};

// Ejecutar
generateFakeData();