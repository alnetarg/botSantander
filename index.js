const axios = require("axios");

let lastDateTimeMovement = new Date('01-01-1970 00:00:00');

//Json Token
let jsonToken = require('./token.json');

//Telegram
const TELEGRAM_BOTID = "";
const TELEGRAM_CHATID = "";

class Telegram {
    sendTelegramMessage(message) {
        const botId = TELEGRAM_BOTID;
        const chatId = TELEGRAM_CHATID;
        if (!botId || !chatId) {
            return;
        }
        try {
            const telegramMsg = encodeURIComponent(message);
            const url = `https://api.telegram.org/bot${botId}/sendMessage?chat_id=${chatId}&text=${telegramMsg}&parse_mode=HTML`;
            axios.get(url);
        } catch (e) {
            console.log(e);
        }
    }
}
const telegram = new Telegram();

const cookies =
        ""

//TODO leo Bearer del archivo token.json para primera ejecución, luego se actualiza con Refresh
var token = jsonToken.token
        
const refreshToken = async () => {
        const url =
            "https://www2.personas.santander.com.ar/obp-servicios/login/refresh";
    
        const headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "es-ES,es;q=0.9,en;q=0.8",
            "authorization": token,
            "content-type": "application/json;charset=UTF-8",
            "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "wil": "https://www2.personas.santander.com.ar/obp-webapp/angular/",
            "x-queueit-ajaxpageurl": "https%3A%2F%2Fwww2.personas.santander.com.ar%2Fobp-webapp%2Fangular%2F%23!%2Fcuentas-inicio",
            "cookie": cookies,
            "Referer": "https://www2.personas.santander.com.ar/obp-webapp/angular/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          };
    
        const body = {
          }   
        
        const result = await axios.post(url, body, { headers });

        //TODO Renuevo Token y variable        
        const newToken = 'Bearer ' + String(result.data.respuesta.token)       
        token = newToken

        let jsonData = { 
            token: newToken
        };
         
        //TODO Grabo el nuevo Token el JSON
        let data = JSON.stringify(jsonData);
        fs.writeFileSync('token.json', data);
        
        return 

};

const getMovimientosSantander = async () => {
    const url =
        "https://www2.personas.santander.com.ar/obp-servicios/movimientos/obtenerMovimientos";
    
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
        "authorization": token,
        "content-type": "application/json;charset=UTF-8",
        "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "wil": "https://www2.personas.santander.com.ar/obp-webapp/angular/",
        "x-queueit-ajaxpageurl": "https%3A%2F%2Fwww2.personas.santander.com.ar%2Fobp-webapp%2Fangular%2F%23!%2Fcuentas-inicio",
        "cookie": cookies,
        "Referer": "https://www2.personas.santander.com.ar/obp-webapp/angular/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      };

    const body = {
        "numero": "",   //* Numero de Cuenta
        "moneda": "",           //* Moneda ARS -> "peso"
        "rango": "DEFAULT",
        "tipoCuenta": "", //* Ej: "CUENTA_UNICA" ; "CAJA_AHORRO_PESOS"
        "primerIngreso": true
      }

    const result = await axios.post(url, body, { headers });

    return result.data.respuesta.itemsMovimiento;
};


const init = async () => {
    
    let movementsSantander = await getMovimientosSantander();
    movementsSantander = movementsSantander.reverse();

    movementsSantander.forEach((movement) => {

        //! Movement.id es un hash dinámico por lo que no sirve como comparador de último movimiento, Referencia no es secuencial por lo que se utiliza comparador de fecha  y hora
        var fecha = movement.fecha
        var hora = movement.hora
                
        const [dia, mes, anio] = fecha.split('/');        
        var fechaHora = anio +'-' + mes + '-' + dia + ' ' + hora                
        var dateTimeMovement = new Date(fechaHora);        
       
        if (dateTimeMovement > lastDateTimeMovement) {
            lastDateTimeMovement = dateTimeMovement;

            //! Se quita IF porque Santander no muestra egresos negativos, se adjunta detalle descripción fecha hora e importe
            //TODO En primera ejecución por consola salen ordenados ok, pero en Telegram llegan desordenados por la API, se probó setTimeout(function, 200) sin mejoras

            const mensaje = `<strong>🏦 Banco</strong>: Santander\n<strong>❗️ Nuevo movimiento:</strong> ${movement.detalle}\n<strong>💰  ${movement.descripcion} :</strong> ${movement.importe} Fecha y Hora: ${movement.fecha} - ${movement.hora} Detalle: ${movement.observacion}`
            telegram.sendTelegramMessage(mensaje);
            //console.log(mensaje)
            

        }

        
        
    });

    refreshToken()    
    
};

setInterval(init, 10000);
