const reservationsRouter = require('./routes/reservations');
const authRouter = require('./routes/auth');
const trajetsRouter = require('./routes/trajets');

app.use('/api/admin', require('./routes/admin'));
app.use('/api', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/trajets', trajetsRouter); 