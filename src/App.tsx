import React from 'react';
import logo from './logo.svg';
import './App.css';
import topRightSrc from './red.png'
import { sequence } from '0xsequence'
import {CheckmarkIcon, Box, IconButton, useTheme, SunIcon, ChevronRightIcon, ChevronLeftIcon, 
  Spinner, Placeholder, Button} from '@0xsequence/design-system'

import { SequenceIndexerClient } from '@0xsequence/indexer'
import controller from './snes.png'
import controllerLight from './snes_light.png'

const contractAddress = '0x95e28ffb005ba76c7eb2d321b2be02219973221e'

let index = 0;
const Splash = (props: any) => {
  const {theme} = useTheme()

  sequence.initWallet('polygon') 

  React.useEffect(() => {
    const image = document.getElementById('controller')!

    if(image) image!.addEventListener('load', () => {
      props.setThemeLoading(false)
    })
  }, [])

  const connect = async () => {

    const wallet = sequence.getWallet()
    const connectWallet = await wallet.connect({
      networkId: 137,
      app: 'Sequence Drop',
      authorize: true,
      settings: {
        theme: 'dark'
      }
    })

    if(connectWallet.connected) {
      props.setLoggedIn(true)
      props.setConnected(connectWallet.connected)
      props.setAddress(connectWallet.session!.accountAddress!)
    }
  }

  return(<>
    <br/>
    <br/>
    <br/>
    <h1 className='title'>Sequence Drop</h1>
    <br/>
    <br/>
    <p className='title'>1-click gasless collectibles</p>
    <br/>
      <img id='controller' className={`jiggle-image ${props.themeLoading ? 'loading' : null}`} src={theme == 'light' ? controllerLight : controller} />
    {props.themeLoading ? <div className={`square`}><Placeholder style={{height: '260px', width: '260px'}}size='xl' width="full" height="full"/></div> : null}
    <br/>
    <br/>
    <Box justifyContent={'center'}>
      <Button onClick={connect} variant={'primary'} size='lg' label="login"/>
    </Box>
  </>)
}

let pendingDrop = false;

function App() {
  const [address, setAddress] = React.useState<any>(null)

  sequence.initWallet('polygon')

  const {theme, setTheme} = useTheme()
  const [step, setStep] = React.useState(0)

  const [minted, setMinted] = React.useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])

  const [collection, setCollection] = React.useState<any>([])
  const [red, setRed] = React.useState(true)
  const [yellow, setYellow] = React.useState(true)
  const [green, setGreen] = React.useState(true)
  const [blue, setBlue] = React.useState(true)
  const [left, setLeft] = React.useState(false)
  const [hoverImage, setHoverImage] = React.useState('')

  const [redClaimed, setRedClaimed] = React.useState(false);
  const [yellowClaimed, setYellowClaimed] = React.useState(false);
  const [greenClaimed, setGreenClaimed] = React.useState(false);
  const [blueClaimed, setBlueClaimed] = React.useState(false);

  const [redImage, setRedImage] = React.useState(collection[index])
  const [blueImage, setBlueImage] = React.useState(collection[index+2])
  const [yellowImage, setYellowImage] = React.useState(collection[index+1])
  const [greenImage, setGreenImage] = React.useState(collection[index+3])

  const [pendingRed, setPendingRed] = React.useState(false)
  const [pendingBlue, setPendingBlue] = React.useState(false)
  const [pendingYellow, setPendingYellow] = React.useState(false)
  const [pendingGreen, setPendingGreen] = React.useState(false)

  const [select, setSelect] = React.useState(false)
  const [connected, setConnected] = React.useState(false)

  const [init, setInit] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [loggedIn, setLoggedIn] = React.useState(false)
  const [themeLoading, setThemeLoading] = React.useState(false)

  const advance = () => {
    if(index < 12 ){
      index = index + 4
      if(!select) setLoading(true)
      setRedImage(collection[index].image)
      setBlueImage(collection[index + 2].image)
      setYellowImage(collection[index + 1].image)
      setGreenImage(collection[index + 3].image)
    }
  }

  const before = () => {
    if(index > 0 ){
      index = index - 4
      if(!select) setLoading(true)
      setRedImage(collection[index].image)
      setBlueImage(collection[index + 2].image)
      setYellowImage(collection[index + 1].image)
      setGreenImage(collection[index + 3].image)
    }
  }

  const getAvailableBalances = async () => {
    const indexer = new SequenceIndexerClient('https://polygon-indexer.sequence.app')

    const nftBalances = await indexer.getTokenBalances({
        contractAddress: contractAddress,
        accountAddress: contractAddress,
        includeMetadata: true
    })

    console.log(nftBalances)

    const nfts = nftBalances.balances.map((nft: any) => {
      return {
        image: nft.tokenMetadata.image,
        tokenID: nft.tokenID
      }
    })
    console.log(nfts)
    setCollection(nfts)
  }

  const getMintedBalances = async () => {
    const indexer = new SequenceIndexerClient('https://polygon-indexer.sequence.app')

    const accountAddress = address

    const nftBalances = await indexer.getTokenBalances({
        accountAddress: accountAddress,
        contractAddress: contractAddress
    })

    console.log(nftBalances)

    const nfts0 = nftBalances.balances.filter((nft: any) => {
      return (nft.contractAddress == contractAddress )
    })

    const nfts = nfts0.map((nft: any) => {
      return {
        tokenID: Number(nft.tokenID),
        balance: Number(nft.balance)
      }
    })

    if(collection.length > 0){
      const assembled: any = []
      collection.map((nft: any ) => {
        let balanceTrue = false;
        nfts.map((nft0: any) => {
          if(nft.tokenID == nft0.tokenID && nft0.balance > 0){
            assembled.push(1)
            balanceTrue = true;
          }
        })
        if(!balanceTrue) assembled.push(0)
      })
      if(!pendingDrop){
        setMinted(assembled)
      }
    }
  }

  React.useEffect(() => {
    if(collection[index]){
      setRedImage(collection[index].image)
      setBlueImage(collection[index + 2].image)
      setYellowImage(collection[index + 1].image)
      setGreenImage(collection[index + 3].image)
    }
  }, [collection])

  React.useEffect(() => {
    let interval: any;
    if(!init){
      if(loggedIn){
        getAvailableBalances()
        interval = setInterval(() => {
          getMintedBalances()
        }, 2000)
      }

      const imageRed = document.getElementById('red')!;

      // loading logic to make sure all images load before displaying media
      if(imageRed) imageRed!.addEventListener('load', function() {
        setInit(true)
        // Image has finished loading
        setPendingRed(false)
        if(!pendingRed && !pendingBlue && !pendingBlue && !pendingYellow){
          setLoading(false)
        }
      })

      const imageBlue = document.getElementById('blue')!;
      if(imageBlue) imageBlue!.addEventListener('load', function() {
        // Image has finished loading
        setPendingBlue(false)
        if(!pendingRed && !pendingBlue && !pendingBlue && !pendingYellow){
          setLoading(false)
        }
      })

      const imageYellow = document.getElementById('yellow')!;
      if(imageYellow) imageYellow!.addEventListener('load', function() {
        // Image has finished loading
        setPendingYellow(false)
        if(!pendingRed && !pendingBlue && !pendingBlue && !pendingYellow){
          setLoading(false)
        }
      })

      const imageGreen = document.getElementById('green')!;
      if(imageGreen) imageGreen!.addEventListener('load', function() {
        // Image has finished loading
        setPendingGreen(false)
        if(!pendingRed && !pendingBlue && !pendingBlue && !pendingYellow){
          setLoading(false)
        }
      })
    }

    // return () => clearInterval(interval)
  }, [collection, index, loggedIn, redImage, minted, step, pendingBlue, pendingRed, pendingGreen, pendingYellow])

  const handleMintChange = (index: any, pending: any) => {
    let items = [...minted];
    items[index] = 1;
    pending(true)
    setMinted(items)
    pendingDrop = true;
    mint(collection[index].tokenID, address)
  }

  const openWallet = async () => {
    const wallet = sequence.getWallet()
    if(!connected){
      const connectWallet = await wallet.connect({
        networkId: 137,
        app: 'Sequence Drop',
        authorize: true,
        settings: {
          theme: theme 
        }
      })
      setConnected(connectWallet.connected)
    }

    wallet.openWallet()
  }

  const mint = (type: any, address: any) => {
    // UNCOMMENT FOR PRODUCTION
    // fetch("https://sequence.energy/transaction", {
    fetch("http://localhost:4000/transaction", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ 
              address: address,
              type: type
            }),
          }).then((res) => {
            console.log(res)
            setTimeout(() => {
              setPendingBlue(false)
              setPendingRed(false)
              setPendingYellow(false)
              setPendingGreen(false)
              pendingDrop = false;
            }, 2000)
          })
  }

  React.useEffect(() => {
    if(theme == 'light') document.body.style.background = 'white'
    else document.body.style.background = 'black'
  }, [theme])
  return (
    <div className="App">
      <Box gap='6'>
        <IconButton style={{position: 'fixed', top: '20px', right: '20px'}} icon={SunIcon} onClick={() => {
          setTheme(theme == 'dark' ? 'light' : 'dark')
          setThemeLoading(true)
        }}/>
      </Box>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      {
        ! loggedIn 
        ? 
          <Splash address={address} setThemeLoading={setThemeLoading} themeLoading={themeLoading} setLoggedIn={setLoggedIn} setAddress={setAddress} setConnected={setConnected}/> 
        :
          <>
            <div className="container">
              <div className="grid-container">
              <div className={`red square ${loading ? 'loading' : null}`} 
                  onMouseLeave={() => {
                    setHoverImage('')
                    setRed(false)
                    setLeft(false)
                  }} 
                  onMouseEnter={()=> {
                    setHoverImage(redImage)
                    setRed(true)
                    setLeft(true)
                  }}
                  >
                  { !select ? minted[index] ? <div className="grid-text">{pendingRed ? <Spinner size='lg'/> : <CheckmarkIcon size={'xl'}/>}</div> : null : null }
                  <div className={`image-wrapper ${minted[index] && !select ? 'claimed' : null}`}>
                    { !select ? <img id="red" src={redImage} alt="your image description"/> : <p>{minted[index]}</p>}
                  </div>
                </div>
                {loading ? <Placeholder/> : null }
                <div className={`blue square ${loading ? 'loading' : null}`}  onMouseLeave={() => {
                    setHoverImage('')
                    setLeft(false)
                  }} 
                  onMouseEnter={()=> {
                    setHoverImage(blueImage)
                    setLeft(false)
                  }}>
                  { !select ? minted[index + 2] ? <div className="grid-text">{pendingBlue ? <Spinner size='lg'/> : <CheckmarkIcon size={'xl'}/>}</div> : null : null }
                  <div className={`image-wrapper ${minted[index + 2] && !select ? 'claimed' : null}`}>
                    { !select ? <img id="blue" src={blueImage} alt="your image description"/> : <p>{minted[index + 2].toString()}</p>}
                  </div>
                </div>
                {loading ? <Placeholder/> : null }

                <div className={`yellow square ${loading ? 'loading' : null}`}  onMouseLeave={() => {
                    setHoverImage('')
                    setLeft(false)
                  }} 
                  onMouseEnter={()=> {
                    setHoverImage(yellowImage)
                    setLeft(true)
                  }}>
                  { !select ? minted[index + 1] ? <div className="grid-text">{pendingYellow ? <Spinner size='lg'/> : <CheckmarkIcon size={'xl'}/>}</div> : null : null }
                  <div className={`image-wrapper ${minted[index + 1] && !select ? 'claimed' : null}`}>
                    { !select ? <img id="yellow" src={yellowImage} alt="your image description"/> : <p>{minted[index + 1]}</p>}
                  </div>
                </div> 
                {loading ? <Placeholder/> : null }

                <div className={`green square ${loading ? 'loading' : null}`}  onMouseLeave={() => {
                    setHoverImage('')
                  }} 
                  onMouseEnter={()=> {
                    setHoverImage(greenImage)
                  }}>
                  { !select ? minted[index + 3] ? <div className="grid-text">{pendingGreen ? <Spinner size='lg'/> : <CheckmarkIcon size={'xl'}/>}</div> : null : null }
                  <div className={`image-wrapper ${minted[index + 3] && !select ? 'claimed' : null}`}>
                    { !select ? <img id="green" src={greenImage} alt="your image description"/> : <p>{minted[index + 3]}</p>}
                  </div>
                </div>
                {loading ? <Placeholder/> : null }

              </div>
              {(hoverImage && (red || yellow) && (left))? <img className='display-left' src={hoverImage} /> : (hoverImage && (red || yellow) && (!left)) ? <img className='display-right' src={hoverImage} />: null }
            </div>
            <div className='spacer'>
            </div>
            <div className="keypad">
              <div className="keypad__inner">
                <div className="keypad__title">Sequence Drop</div><br/>
                <div className="keypad__subtitle">NFT Entertainment system</div>
                <div className="central-button-container select" onClick={() => setSelect((prev: any) => !prev)}>
                  <div className="central-button"></div>
                  <br/>
                  <p className='p'>Details</p>
                </div>
                <div className="central-button-container start" onClick={openWallet}>
                  <div className="central-button"></div>
                  <br/>
                  <p className='p'>&nbsp;&nbsp;Wallet</p>
                </div>
              </div>
              <div className="pad-left">
                <div className="cross-x" >
                  <div className='container'>
                    <div className="left" onClick={() => before()}><ChevronLeftIcon size='xl'/></div>
                    <div className="right" onClick={() => advance()}><ChevronRightIcon size='xl'/></div>
                  </div>
                </div>
              </div>
              <div className="pad-right">
                <div className="circular-button y-button" onClick={() => { handleMintChange(index + 3, setPendingGreen); setGreenClaimed(true)}}></div>
                <div className="circular-button b-button" onClick={() => { handleMintChange(index + 1, setPendingYellow); setYellowClaimed(true)}}></div>
                <div className="circular-button x-button" onClick={() =>{handleMintChange(index + 2, setPendingBlue); setBlueClaimed(true)}}></div>
                <div className="circular-button a-button" onClick={() => {handleMintChange(index, setPendingRed); setRedClaimed(true)}}></div>
                <div className="ab-container circular-button-container"></div>
                <div className="xy-container circular-button-container"></div>
              </div>
              <div className="l-button top-button"></div>
              <div className="r-button top-button"></div>
              <div className="wire"></div>
            </div>
          </>
      }
    </div>
  );
}

export default App;