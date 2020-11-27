import TEST_CONFIG from '../config.test.json';

let CONFIG;
 export default CONFIG = process.env.NODE_ENV != 'production' ? TEST_CONFIG : {
    "BITBANK": {
        "APIKEY": process.env.BB_APIKEY,
        "APISECRET": process.env.BB_APISECRET
    },
    "FTX": {
        "APIKEY": process.env.FTX_APIKEY,
        "APISECRET": process.env.FTX_APISECRET
    },
    "LINE": {
        "BEARER_ACCESS_TOKEN": process.env.BEARER_ACCESS_TOKEN,
        "USER_ID": process.env.USER_ID,
        "ALL_NOTIF": false
    },
    "CREDENTIALS": {
        "installed": {
            "clien_id": process.env.client_id,
            "client_secret": process.env.client_secret,
            "redirect_uris": [
                "urn:ietf:wg:oauth:2.0:oob",
                "http://localhost"
            ]
        }
    },
    "TOKEN": {
        "access_token": process.env.access_token,
        "refresh_token": process.env.refresh_token,
        "scope": "https://www.googleapis.com/auth/spreadsheets",
        "token_type": "Bearer",
        "expiry_date": 1605062558223

    },
    "SPREAD_SHEET": {
        "SHEET_ID": process.env.SHEET_ID
    }
}