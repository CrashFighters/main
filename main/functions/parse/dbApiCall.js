module.exports = {
    execute(request) {

        //todo: parse with require('url')

        //Remove api beginning
        const call = request.url.split('/dbApi/').join('');

        let success = true;
        let params = {};
        let path = call;

        if (['GET', 'DELETE'].includes(request.method)) {
            //If path includes params
            if (path.includes('?') && path.split('?')[1]) {
                //Set params
                path
                    .split('?')[1]      //Take only params
                    .split('&')         //Split params
                    .forEach(val => {   //Loop over params
                        params[
                            val.split('=')[0]           //Take key
                        ] =                             //Set the params value
                            decodeURIComponent(         //Decode URI
                                val
                                    .split('=')[1]      //Take value
                                    .replace(/\+/g, ' ')//Replace "+" with " "
                            )
                    })


                path = path.split('?')[0];  //Set path to path without params
            }
        } else if (request.headers['content-type'] === 'application/json')
            try {
                params = JSON.parse(request.headers.body);
            } catch {
                success = false;
            }

        path = `/${path}` //Add "/" to start of path

        return { path, params, success };
    }
}