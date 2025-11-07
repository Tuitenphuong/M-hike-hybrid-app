var config = {
    appId: 'com.mhike.app',
    appName: 'M-Hike',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    android: {
        allowMixedContent: true
    },
    plugins: {
        CapacitorSQLite: {
            iosDatabaseLocation: 'Library/CapacitorDatabase',
            iosIsEncryption: false,
            iosKeychainPrefix: 'mhike',
            iosBiometric: {
                biometricAuth: false,
                biometricTitle: 'Biometric login for capacitor sqlite'
            },
            androidIsEncryption: false,
            androidBiometric: {
                biometricAuth: false,
                biometricTitle: 'Biometric login for capacitor sqlite',
                biometricSubTitle: 'Log in using your biometric'
            }
        }
    }
};
export default config;
