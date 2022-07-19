import '../styles/globals.css'
import NextNProgress from 'nextjs-progressbar'
import{ createTheme } from '@mui/material/styles'
import { ThemeProvider } from '@emotion/react'

const theme = createTheme({
  palette: {
    primary: {
      main: '#046767',
    },
    secondary: {
      main: '#024848',
    }
  }
})

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider 
      theme={theme}
    >
      <NextNProgress />
      <Component {...pageProps} />
    </ThemeProvider>
  )



}

export default MyApp
