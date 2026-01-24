// Test 1: Pure React (Control)
const TestControl = () => <div style={{ color: 'green' }}>✅ Control Test Passed</div>;

// Test 2: Types Import
// We import types but don't use them to see if the import itself crashes
import * as Types from './types';
const TestTypes = () => {
    console.log('Types loaded:', Types);
    return <div style={{ color: 'green' }}>✅ Types Import Passed</div>;
};

// Test 3: API Service Import (Axios)
import { api } from './services/api';
const TestApi = () => {
    console.log('API Service loaded:', api);
    return <div style={{ color: 'green' }}>✅ API Service Import Passed</div>;
};

// Test 4: Auth Service Import
import { authService } from './services/auth.service';
const TestAuthService = () => {
    console.log('Auth Service loaded:', authService);
    return <div style={{ color: 'green' }}>✅ Auth Service Import Passed</div>;
};

// Test 5: Provider Import
import { AuthProvider } from './providers/AuthProvider';
const TestProvider = () => {
    return (
        <AuthProvider>
            <div style={{ color: 'green' }}>✅ AuthProvider Context Passed</div>
        </AuthProvider>
    );
};

export const DebugSuite = () => {
    // const [error, setError] = useState<string | null>(null);

    return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            <h1>System Diagnostic Suite</h1>

            <h3>Test 1: Control</h3>
            <TestControl />

            <h3>Test 2: Types Import</h3>
            <TestTypes />

            <h3>Test 3: API Service (Axios)</h3>
            <TestApi />

            <h3>Test 4: Auth Service</h3>
            <TestAuthService />

            <h3>Test 5: Auth Provider</h3>
            <TestProvider />
        </div>
    );
};
