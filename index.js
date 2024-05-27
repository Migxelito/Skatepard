const express = require('express');
require('dotenv').config()
const app = express();
const { engine } = require('express-handlebars');
const jwt = require('jsonwebtoken')
const expressFileUploaded = require("express-fileupload");

const { consultarUsuarios,
    nuevoUsuario,
    setUsuarioStatus,
    conseguirUsuario,
    setDatosUsuario,
    eliminarCuenta } = require('./consultas')

const PORT = 3000;
const secretKey = process.env.SECRET

//MIDDLEWARES
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use("/bs", express.static(__dirname + "/node_modules/bootstrap/dist"))
app.use("/ax", express.static(__dirname + "/node_modules/axios/dist"))


 app.use(
     expressFileUploaded({
         limits: 5000000,
         abortOnLimit: true,
         responseOnLimit: 'El tamaño de la imagen supera los 5mb'
     })
 )

app.engine("handlebars", engine({
    partialsDir: __dirname + "/views/components"
}));

app.set("view engine", "handlebars");
app.set("views", "./views");

// Ruta raíz
app.get('/', (req,res) => {
    res.render('Index');
})

// Ruta para registro
app.get('/registro',(req,res) => {
    res.render('Registro')
})

// Ruta para login
app.get('/login',(req,res) => {
    res.render('Login')
})

// Ruta para admin
app.get('/admin', async (req,res) => {
    try {
        const usuarios = await consultarUsuarios()
        res.render('Admin', { usuarios })
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta GET /usuarios
app.get('/usuarios', async (req,res) => {
    const respuesta = await consultarUsuarios();
    res.send(respuesta);
})

// Ruta POST /usuario
app.post('/usuario', async (req,res) => {
    const { email,nombre,password,anhos,especialidad,nombre_foto } = req.body; 

    try {
        const respuesta = await nuevoUsuario(email,nombre,password,anhos,especialidad,nombre_foto);
        res.status(201).send(respuesta);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta POST /subir_foto
app.post('/registrar',async (req,res) => {

    const { email,nombre,password,password_2,anhos,especialidad } = req.body;
    const { foto } = req.files;
    const { name } = foto;
   
    if ( password !== password_2) { 
        res.send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
    } else {
        try {
            const respuesta = await nuevoUsuario(email,nombre,password,anhos,especialidad,name)
            .then(() => {
                foto.mv(`${__dirname}/public/uploads/${name}`,(err) => {
                    res.send('<script>alert("Se ha registrado con éxito."); window.location.href = "/login"; </script>');
                });
            })
            
        } catch (e) {
            res.status(500).send({
                error: `Algo salió mal... ${e}`,
                code: 500
            })
        }
    }
    
})

// Ruta PUT para cambiar estado de usuario
app.put('/usuarios', async (req,res) => {
    const { id,estado } = req.body;
    try {
        const usuario = await setUsuarioStatus(id,estado);
        res.status(200).send(usuario);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta POST para inicio de sesión
app.post('/verify', async (req,res) => {
    const { email,password } = req.body;
    const user = await conseguirUsuario(email,password)

    if (email === '' || password === '') {
        res.status(401).send({
            error:'Debe llenar todos los campos',
            code: 401,
        })
    } else {

        if(user.length != 0 ) {
            if ( user[0].estado === true) {
                const token = jwt.sign(
                    {
                        exp: Math.floor(Date.now() / 1000) + 180,
                        data: user,
                    },
                    secretKey
                );
                res.send(token);
            } else {
                res.status(401).send({
                    error:'El registro de este usuario no ha sido aprobado',
                    code: 401,
                })
            }
        } else {
            res.status(404).send({
                error: 'Este usuario no está registrado en la base de datos o la contraseña es incorrecta.',
                code: 404,
            });
        }
    }
    
});

// Ruta para datos
app.get('/datos',(req,res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        const { data } = decoded
        /* const { nombre,email } = data */
        const email = data[0].email;
        const nombre = data[0].nombre;
        const password = data[0].password;
        const anos_experiencia = data[0].anos_experiencia;
        const especialidad = data[0].especialidad;
        err
            ? res.status(401).send({
                error : '401 Unauthorized',
                message: 'Usted no está autorizado para estar aquí',
                token_error: err.message,
            })
            : res.render('datos', { email,nombre,password,anos_experiencia,especialidad })
    })
})

// Ruta GET /datos_usuario
app.get('/datos_usuario', async (req,res) => {
    const respuesta = await consultarUsuarios();
    res.send(respuesta);
})


// Ruta PUT para cambiar datos de usuario
app.put('/datos_perfil', async (req,res) => {
    const { email,nombre,password,anhos,especialidad } = req.body;

    try {
        const usuario = await setDatosUsuario(email,nombre,password,anhos,especialidad);
        res.status(200).send(usuario);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta DELETE para eliminar cuenta
app.delete('/eliminar_cuenta/:email', async (req,res) => {
    
    try {
        const { email } = req.params;
        const respuesta = await eliminarCuenta(email);
        res.sendStatus(200).send(respuesta);
        
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})





app.listen(PORT, () => console.log(`CORRIENDO EN EL PUERTO ${PORT}`));