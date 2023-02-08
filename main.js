import express from 'express';
import cors from 'cors';

import { errorHandle as eH } from './utils';
import { reqValidation } from './middlewares/validationCatcher';
import { preAuthenticate, verifyAuthentication } from './controller/authentication';


const app = express();

app.use(express.json());
/*  Using this because to parse json data.Meaning that it is the format that data exchange b/w frontend(FE) and backend(BE).
For that we were using body parser a third pary library . For that express team integrated the body parser inside the express so we dont have to use the third party library.
So we just use app.use(express.json())
*/
app.use(cors());

app.post('/authenticate', preAuthenticate, reqValidation, eH(verifyAuthentication));


const PORT  = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`IS is running on PORT ${PORT}`);
})
