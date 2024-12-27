'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Send, Minimize2, Maximize2, X } from 'lucide-react'
import { useTheme } from 'next-themes'

interface AIChatProps {
  hotelId: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChat({ hotelId }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulated AI response - replace with actual API call
    setTimeout(() => {
      const aiMessage: Message = { role: 'assistant', content: `You asked about "${input}". Here's a helpful response from the AI.` }
      setMessages((prevMessages) => [...prevMessages, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsExpanded(false)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed ${isExpanded ? 'inset-0' : 'bottom-20 right-4 w-80'} z-50`}
          >
            <Card className={`shadow-lg ${isExpanded ? 'h-full' : 'h-[500px]'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat con IA</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={toggleExpand} aria-label={isExpanded ? "Minimizar chat" : "Expandir chat"}>
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleChat} aria-label="Cerrar chat">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className={`pr-4 ${isExpanded ? 'h-[calc(100vh-180px)]' : 'h-[360px]'}`}>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-secondary text-secondary-foreground'
                      } max-w-[80%] ${message.role === 'user' ? 'float-right clear-both' : 'float-left clear-both'}`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-secondary text-secondary-foreground p-2 rounded-lg float-left clear-both">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                      >
                        Escribiendo...
                      </motion.div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-grow"
                  />
                  <Button type="submit" size="icon" aria-label="Enviar mensaje">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          className={`rounded-full w-16 h-16 shadow-lg ${
            isOpen ? 'bg-primary text-primary-foreground' : ''
          }`}
          onClick={toggleChat}
          aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
        >
          <MessageSquare size={24} />
        </Button>
      </motion.div>
    </>
  )
}

