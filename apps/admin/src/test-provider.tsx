import React from 'react';

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{ border: '5px solid green', padding: 20 }}>
            <h2>Test Provider is Working</h2>
            {children}
        </div>
    );
};
