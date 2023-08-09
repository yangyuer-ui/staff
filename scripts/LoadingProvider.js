 const LoadingContext = createContext({
    show: (type,message) => {
    },
    hide:()=>{}
})

export default function LoadingProvider({children}) {
    const [visible,setVisible] = useState(false)
    const typeRef = useRef()
    const messageRef = useRef()
    return(
        <LoadingContext.Provider
            value={{
                show:(type, message) => {
                   typeRef.current = type
                    messageRef = type
                    setVisible(true)
                },
                hide:()=>{
                    setVisible(false)
                }
            }} >
          {children}
          <LoadingModal
            visible={visible}
            type={type}
            message={message}
            onClose={()=>setVisible(false)}/>
        </LoadingContext.Provider>
    )
}