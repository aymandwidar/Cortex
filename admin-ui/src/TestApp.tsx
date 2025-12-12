export default function TestApp() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 40%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '32px', fontWeight: '300' }}>
          CORTEX OS
        </h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          React is working! 🎉
        </p>
      </div>
    </div>
  )
}