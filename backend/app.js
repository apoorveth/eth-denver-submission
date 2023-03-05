const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cors = require('cors');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());

// const { mainFunc } = require('./ApproveGasless');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
const approvalRouters = require('./approve/router/approveRouter');

app.get('/', (req, res) => {
    res.send('Gasless server running!!!');
});

app.use('/mtx', approvalRouters);

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
