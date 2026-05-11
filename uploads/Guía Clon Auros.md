# **Guía Base: Clon de UI estilo Auros.global**

Este documento contiene la estructura base para replicar la estética visual y las animaciones de un sitio web Web3/Fintech moderno usando **Next.js (React)**, **Tailwind CSS**, **Framer Motion** y **Lenis** (para el scroll suave).

## **1\. Instalación de Dependencias**

Antes de comenzar, asegúrate de instalar las librerías necesarias para las animaciones y el scroll fluido. Abre tu terminal y ejecuta:

npm install framer-motion lenis

*Nota:* **Lenis** es la librería responsable de interceptar el scroll nativo del navegador y hacerlo extremadamente suave ("smooth scroll"), lo cual es vital para sitios web con estética premium.

## **2\. Configuración de Tailwind CSS**

En tu archivo tailwind.config.js, agrega los colores oscuros y el gradiente radial para el "Aura" de fondo que le da ese toque característico.

// tailwind.config.js  
module.exports \= {  
  content: \[  
    "./pages/\*\*/\*.{js,ts,jsx,tsx,mdx}",  
    "./components/\*\*/\*.{js,ts,jsx,tsx,mdx}",  
    "./app/\*\*/\*.{js,ts,jsx,tsx,mdx}",  
  \],  
  theme: {  
    extend: {  
      colors: {  
        dark: '\#0a0a0a',  
        'dark-card': '\#111111',  
        accent: '\#3b82f6', // Azul sutil para destellos  
      },  
      backgroundImage: {  
        'aura-gradient': 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',  
      }  
    },  
  },  
  plugins: \[\],  
}

## **3\. Estructura del Componente Principal (Layout y Animaciones)**

Este es el código base para tu página (por ejemplo, page.jsx en Next.js App Router). Incluye la inicialización de Lenis en un useEffect y las animaciones con Framer Motion.

'use client'; 

import { useEffect } from 'react';  
import { motion } from 'framer-motion';  
import Lenis from 'lenis';

// Variantes para animaciones de revelado (Reveal)  
const fadeInUp \= {  
  initial: { opacity: 0, y: 30 },  
  animate: { opacity: 1, y: 0 },  
  transition: { duration: 0.8, ease: \[0.6, 0.05, 0.01, 0.9\] }  
};

export default function AurosClone() {  
    
  // Inicialización de Lenis Scroll  
  useEffect(() \=\> {  
    const lenis \= new Lenis({  
      duration: 1.2,  
      easing: (t) \=\> Math.min(1, 1.001 \- Math.pow(2, \-10 \* t)),   
      smooth: true,  
    });

    function raf(time) {  
      lenis.raf(time);  
      requestAnimationFrame(raf);  
    }

    requestAnimationFrame(raf);

    return () \=\> {  
      lenis.destroy();  
    };  
  }, \[\]);

  return (  
    // Usa las clases de tu propia tipografía aquí (ej. font-tuFuente)  
    \<div className="min-h-screen bg-dark text-white selection:bg-accent selection:text-white font-sans"\>  
        
      {/\* Fondo con gradiente de "Aura" \*/}  
      \<div className="fixed inset-0 pointer-events-none bg-aura-gradient" /\>

      {/\* Navbar Minimalista \*/}  
      \<nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-6 backdrop-blur-md border-b border-white/5"\>  
        \<div className="text-2xl font-bold tracking-tighter"\>TU\_LOGO\</div\>  
        \<div className="hidden md:flex space-x-8 text-sm font-medium text-gray-400"\>  
          \<a href="\#" className="hover:text-white transition-colors"\>Servicio 1\</a\>  
          \<a href="\#" className="hover:text-white transition-colors"\>Servicio 2\</a\>  
          \<a href="\#" className="hover:text-white transition-colors"\>Contacto\</a\>  
        \</div\>  
        \<button className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all"\>  
          Acción  
        \</button\>  
      \</nav\>

      {/\* Hero Section \*/}  
      \<main className="relative pt-40 px-6 max-w-7xl mx-auto"\>  
        \<motion.div   
          initial="initial"  
          animate="animate"  
          className="max-w-4xl"  
        \>  
          \<motion.span variants={fadeInUp} className="text-accent text-sm uppercase tracking-widest"\>  
            Tu subtítulo aquí  
          \</motion.span\>  
          \<motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-medium leading-\[1.1\] mt-4 tracking-tight"\>  
            El título principal \<br /\>  
            \<span className="text-gray-500"\>de tu proyecto\</span\>  
          \</motion.h1\>  
          \<motion.p variants={fadeInUp} className="text-xl text-gray-400 mt-8 max-w-2xl leading-relaxed"\>  
            Una descripción elegante sobre lo que hace el producto o servicio, manteniendo el estilo limpio y directo.  
          \</motion.p\>  
        \</motion.div\>

        {/\* Ejemplo para insertar tu imagen en el Hero \*/}  
        {/\* \<motion.div variants={fadeInUp} className="mt-12 overflow-hidden rounded-3xl border border-white/10"\>  
          \<img src="/tu-imagen-principal.jpg" alt="Hero" className="w-full h-auto object-cover" /\>  
        \</motion.div\>   
        \*/}

        {/\* Grid de Servicios (Estilo Glassmorphism / Bento) \*/}  
        \<section className="mt-40 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20"\>  
          \<ServiceCard   
            title="Servicio Especializado 1"   
            desc="Descripción detallada de tu primer servicio usando el estilo de tarjeta con hover."  
            // image="/ruta-a-tu-imagen-1.jpg"   
          /\>  
          \<ServiceCard   
            title="Servicio Especializado 2"   
            desc="Descripción detallada de tu segundo servicio manteniendo la cohesión visual."  
            // image="/ruta-a-tu-imagen-2.jpg"  
          /\>  
        \</section\>  
      \</main\>  
    \</div\>  
  );  
}

// Componente de Tarjeta con efecto Hover  
function ServiceCard({ title, desc, image }) {  
  return (  
    \<motion.div   
      whileHover={{ y: \-5 }}  
      className="p-10 rounded-3xl bg-dark-card border border-white/10 hover:border-white/20 transition-all group cursor-pointer relative overflow-hidden"  
    \>  
      {/\* Brillo interior sutil \*/}  
      \<div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-all z-0" /\>  
        
      \<div className="relative z-10"\>  
        \<h3 className="text-3xl font-medium mb-4"\>{title}\</h3\>  
        \<p className="text-gray-400 leading-relaxed mb-8"\>{desc}\</p\>  
          
        {/\* Integración de tus imágenes dentro de las tarjetas \*/}  
        {image && (  
          \<div className="w-full h-48 mb-6 overflow-hidden rounded-xl"\>  
            \<img src={image} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" /\>  
          \</div\>  
        )}

        \<div className="flex items-center text-sm font-bold group-hover:gap-2 transition-all text-white"\>  
          SABER MÁS \<span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent"\>→\</span\>  
        \</div\>  
      \</div\>  
    \</motion.div\>  
  );  
}

## **4\. Notas sobre tus Activos (Assets)**

* **Tus Tipografías:** Asegúrate de importar tus fuentes en tu archivo CSS global (usando @font-face o importaciones de Google Fonts) o configurarlas mediante next/font (si usas Next.js). Luego, simplemente aplica el nombre de tu clase de fuente en el contenedor principal (ej. \<div className="... font-tuFuentePropia"\>).  
* **Tus Imágenes:** He dejado espacios preparados (como la variable image en ServiceCard y un bloque comentado en el Hero) para que inyectes tus propias fotografías.  
* **Bordes y Máscaras:** Recuerda usar clases como overflow-hidden y rounded-2xl o rounded-3xl en los contenedores de tus imágenes. Esto evita que las esquinas cuadradas de tus imágenes rompan la estética redondeada ("bento grid") de las tarjetas.