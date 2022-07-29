let express = require('express');

let app = express();

const PORT = 3000;

app.use('*', express.json());

app.get('/', (req, res) => {
    res.status(200);
    res.send('Hello world')
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});