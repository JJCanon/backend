// seed.js
const db = require('./config/db');
const bcrypt = require('bcrypt');
const moment = require('moment');

// Datos de los usuarios a crear
const usersToCreate = [
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

// Función para generar un hash de la contraseña
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Función para generar datos aleatorios de consumo/producción
function generateRandomData(startDate, endDate, count) {
    const data = [];
    const timeDiff = endDate - startDate;

    for (let i = 0; i < count; i++) {
        // Fecha aleatoria entre startDate y endDate
        const randomDate = new Date(startDate.getTime() + Math.random() * timeDiff);

        // Valor aleatorio entre 10 y 1000 con 2 decimales
        const randomValue = parseFloat((Math.random() * (1000 - 10) + 10).toFixed(2));

        data.push({
            date: randomDate,
            value: randomValue
        });
    }

    // Ordenar los datos por fecha
    return data.sort((a, b) => a.date - b.date);
}

// Función principal
async function seedDatabase() {
    try {
        // Primero eliminar datos existentes para evitar duplicados
        await db.none('DELETE FROM consumptions');
        await db.none('DELETE FROM productions');
        await db.none('DELETE FROM users WHERE email IN ($1, $2)',
            [usersToCreate[0].email, usersToCreate[1].email]);

        // Crear usuarios
        const createdUsers = [];
        for (const userData of usersToCreate) {
            const passwordHash = await hashPassword(userData.password);

            const result = await db.one(
                `INSERT INTO users (names, surnames, email, passwordHash, userType, cedulaOrNit)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [
                    userData.names,
                    userData.surnames,
                    userData.email,
                    passwordHash,
                    userData.userType,
                    userData.cedulaOrNit
                ]
            );

            createdUsers.push({ id: result.id, ...userData });
        }

        console.log('Usuarios creados exitosamente');

        // Definir rango de fechas (20 de enero a 15 de mayo)
        const startDate = new Date('2024-01-20');
        const endDate = new Date('2024-05-15');

        // Para cada usuario, crear consumos y producciones
        for (const user of createdUsers) {
            console.log(`Generando datos para usuario ${user.names} (ID: ${user.id})...`);

            // Generar 80 consumos
            const consumptions = generateRandomData(startDate, endDate, 80);
            for (const consumption of consumptions) {
                await db.none(
                    `INSERT INTO consumptions (userId, consumptionValue, consumptionDate)
                     VALUES ($1, $2, $3)`,
                    [
                        user.id,
                        consumption.value,
                        moment(consumption.date).format('YYYY-MM-DD HH:mm:ss')
                    ]
                );
            }

            // Generar 80 producciones
            const productions = generateRandomData(startDate, endDate, 80);
            for (const production of productions) {
                await db.none(
                    `INSERT INTO productions (userId, productionValue, productionDate)
                     VALUES ($1, $2, $3)`,
                    [
                        user.id,
                        production.value,
                        moment(production.date).format('YYYY-MM-DD HH:mm:ss')
                    ]
                );
            }

            console.log(`Datos generados para usuario ${user.names}`);
        }

        console.log('Proceso completado exitosamente');
    } catch (error) {
        console.error('Error durante la ejecución:', error);
    }
}

// Ejecutar el script
seedDatabase();