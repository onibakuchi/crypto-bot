let CONFIG;
export default CONFIG = {
    "BITBANK": {
        "APIKEY": process.env.BB_APIKEY,
        "APISECRET": process.env.BB_APISECRET
    },
    "FTX": {
        "APIKEY": process.env.FTX_APIKEY,
        "APISECRET": process.env.FTX_APISECRET
    },
    "BITMEX": {
        "APIKEY": process.env.BITMEX_APIKEY,
        "APISECRET": process.env.BITMEX_APISECRET
    },
    "TRADE": {
        "MODE": process.env.MODE,
        "SYMBOL": process.env.SYMBOL,
        "MAX_ACTIVE_ORDERS": process.env.MAX_ACTIVE_ORDERS,
        "MAX_LEVERAGE": process.env.MAX_LEVERAGE,
        "PYRAMIDING": process.env.PYRAMIDING,
        "TIMEFRAME": process.env.TIMEFRAME,
    },
    "DB": {
        "URI": process.env.URI,
        "DB_NAME": process.env.DB_NAME,
        "COLLECTION_NAME": process.env.COLLECTION_NAME,
        "DB_PASSWORD": process.env.MONGO_DB_PASSWORD,
    },
    "LINE": {
        "BEARER_ACCESS_TOKEN": process.env.BEARER_ACCESS_TOKEN,
        "USER_ID": process.env.USER_ID,
        "ALL_NOTIF": false
    },
    "ARB": {
        "BASIS": process.env.BASIS
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