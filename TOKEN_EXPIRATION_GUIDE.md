# Token Expiration & Auto-Logout Guide

## Fitur yang Ditambahkan

### 1. **Token Expiration Monitoring**

- ✅ Monitor token expiration secara real-time
- ✅ Warning 5 menit sebelum expired
- ✅ Auto logout ketika token expired
- ✅ Countdown timer untuk user

### 2. **Components yang Ditambahkan**

#### `TokenExpirationWarning.tsx`

- Modal warning ketika token akan expired
- Countdown timer 60 detik
- Opsi extend session atau logout
- Auto logout jika user tidak merespon

#### `SessionTimer.tsx`

- Display session time remaining
- Color coding (hijau/kuning/merah)
- Warning indicator untuk session yang akan expired

#### `useTokenExpiration.ts` (Hook)

- Monitor token expiration setiap 10 detik
- Warning threshold: 5 menit
- Auto logout functionality
- Browser notification support

### 3. **API Client Enhancement**

- ✅ Handle 401 responses dengan code `TOKEN_EXPIRED`
- ✅ Auto logout ketika token invalid/expired
- ✅ Better error handling untuk auth issues

## Cara Kerja

### 1. **Token Monitoring**

```typescript
// Hook untuk monitor token
const { timeRemaining, isExpired, showWarningModal } = useTokenExpiration({
  warningThreshold: 300, // 5 menit
  checkInterval: 10000, // 10 detik
  autoLogout: true,
});
```

### 2. **Warning System**

- **5 menit sebelum expired**: Warning modal muncul
- **60 detik countdown**: User harus pilih extend atau logout
- **Auto logout**: Jika tidak merespon dalam 60 detik

### 3. **API Response Handling**

```typescript
// Server response untuk expired token
{
  "message": "Token has expired",
  "code": "TOKEN_EXPIRED"
}
```

## Implementasi di Pages

### Profile Page

```tsx
import { TokenExpirationWarning } from "@/components/TokenExpirationWarning";
import { SessionTimer } from "@/components/SessionTimer";

export default function ProfilePage() {
  return (
    <>
      <TokenExpirationWarning />
      <div className="flex justify-between items-center">
        <h1>Update Profile</h1>
        <SessionTimer />
      </div>
    </>
  );
}
```

## Konfigurasi

### 1. **Warning Threshold**

```typescript
// Di useTokenExpiration hook
warningThreshold: 300; // 5 menit sebelum expired
```

### 2. **Check Interval**

```typescript
// Frekuensi pengecekan token
checkInterval: 10000; // 10 detik
```

### 3. **Auto Logout**

```typescript
// Enable/disable auto logout
autoLogout: true;
```

## User Experience

### 1. **Normal Session**

- Timer hijau: Session masih lama
- Timer kuning: Session akan expired dalam 15 menit
- Timer merah: Session akan expired dalam 5 menit

### 2. **Warning Modal**

- Muncul 5 menit sebelum expired
- Countdown 60 detik
- Opsi: Extend Session / Logout Now / Dismiss

### 3. **Auto Logout**

- Jika token expired: Auto redirect ke login
- Jika user tidak merespon warning: Auto logout
- Clear semua auth data dari localStorage

## Security Features

### 1. **Token Validation**

- Check expiration time setiap request
- Validate token format
- Handle malformed tokens

### 2. **Auto Cleanup**

- Clear localStorage dan sessionStorage
- Redirect ke login page
- Prevent access to protected routes

### 3. **API Protection**

- 401 responses dengan specific error codes
- Auto logout pada client side
- Prevent unauthorized API calls

## Testing

### 1. **Test Token Expiration**

```bash
# Set token expiration ke 1 menit untuk testing
# Edit JWT_SECRET atau expiration time di jwt.ts
```

### 2. **Test Warning Modal**

- Login dengan token yang akan expired
- Tunggu warning modal muncul
- Test semua button options

### 3. **Test Auto Logout**

- Biarkan token expired
- Verify redirect ke login page
- Check localStorage cleared

## Troubleshooting

### 1. **Token tidak terdeteksi expired**

- Check JWT_SECRET consistency
- Verify token format
- Check browser console untuk errors

### 2. **Warning modal tidak muncul**

- Check warningThreshold setting
- Verify useTokenExpiration hook usage
- Check component mounting

### 3. **Auto logout tidak bekerja**

- Check forceLogout function
- Verify localStorage clearing
- Check redirect logic

## Customization

### 1. **Change Warning Time**

```typescript
// Di component atau hook
warningThreshold: 600; // 10 menit
```

### 2. **Change Check Frequency**

```typescript
// Lebih sering check untuk testing
checkInterval: 5000; // 5 detik
```

### 3. **Disable Auto Logout**

```typescript
// Untuk development
autoLogout: false;
```

## Browser Support

### 1. **Notifications**

- Modern browsers support browser notifications
- Fallback ke alert() jika tidak support
- User harus grant permission

### 2. **localStorage**

- Supported di semua modern browsers
- Fallback ke sessionStorage jika perlu
- Clear semua storage types

### 3. **Timer Accuracy**

- JavaScript timers tidak 100% accurate
- Check interval untuk compensation
- Server-side validation tetap penting

## Best Practices

### 1. **User Communication**

- Clear warning messages
- Countdown timer untuk urgency
- Multiple action options

### 2. **Data Protection**

- Clear sensitive data on logout
- Prevent data loss with warnings
- Save user work before logout

### 3. **Performance**

- Efficient token checking
- Minimal re-renders
- Cleanup intervals properly

Fitur ini memastikan user experience yang baik sambil menjaga security aplikasi!
