const { Pool } = require('pg');
const { pool } = require('./db/pool');

async function consultarUsuarios() {
    try {
        const result = await pool.query(`SELECT id, email, nombre, anos_experiencia, especialidad,foto, estado FROM skater ORDER BY id`);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Función asincrónica para ingresar un usuario
async function nuevoUsuario(email,nombre,password,anhos,especialidad,foto) {
    try {
        const result = await pool.query(
            `INSERT INTO skater 
            (email,nombre,password,anos_experiencia,especialidad,foto,estado)
            VALUES ('${email}','${nombre}','${password}','${anhos}','${especialidad}','${foto}',false)
            RETURNING *`
        )
    } catch (e) {
        console.log(e);
    }
}

// Función asincrónica para cambiar el estado de un usuario
async function setUsuarioStatus(id,estado) {
    const result =  await pool.query(
        `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`
    )

    const usuario = result.rows[0];
    return usuario;
}

// Función asincrónica para solicitar email y password de usuario
async function conseguirUsuario(email,password) {
    try {
        const result = await pool.query(`SELECT * FROM skater 
                                        WHERE email = '${email}' AND
                                        password = '${password}'`);
        return result.rows;
    } catch (e) {
        console.log(e);
    }
}

// Función asincrónica para cambiar estado de la cuenta de usuario
async function setUsuarioStatus(id,estado) {
    const result =  await pool.query(
        `UPDATE skater SET estado = ${estado} WHERE id = ${id} RETURNING *`
    )

    const usuario = result.rows[0];
    return usuario;
}

// Función asincrónica para editar datos de usuario
async function setDatosUsuario(email,nombre,password,anhos,especialidad) {
    const result =  await pool.query(
        `UPDATE skater SET 
            nombre = '${nombre}',
            password = '${password}',
            anos_experiencia = ${anhos},
            especialidad = '${especialidad}'
            WHERE email = '${email}' RETURNING *`
    )

    const usuario = result.rows[0];
    return usuario;
}

// Función asincrónica para eliminar cuenta
async function eliminarCuenta (email) {
    const result = await pool.query(`
        DELETE FROM skater WHERE email = '${email}'
    `);

    return result.rowCount;
}

module.exports = { 
    consultarUsuarios,
    nuevoUsuario,
    setUsuarioStatus,
    conseguirUsuario,
    setDatosUsuario,
    eliminarCuenta };