import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<AppRouter />);