import transferReservationRoutes from './routes/transferReservationRoutes';
import transferOrderRoutes from './routes/transferOrderRoutes';

// Register TransferReservation routes
app.use('/api/transfer-reservations', transferReservationRoutes);

// Register TransferOrder routes
app.use('/api/transfer-orders', transferOrderRoutes);