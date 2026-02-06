import { useState, useRef, useEffect } from 'react';
import robotImg from '../assets/robot.png';

export default function RobotMascot() {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate rotation based on cursor position relative to center of the robot
        // Limit rotation to avoid flipping (max 25 degrees)
        const rotateY = ((mouseX - centerX) / (window.innerWidth / 2)) * 25;
        const rotateX = ((centerY - mouseY) / (window.innerHeight / 2)) * 25;

        setRotate({ x: rotateX, y: rotateY });
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="robot-mascot-container animate-float"
            ref={containerRef}
            style={{
                perspective: '1000px',
                maxWidth: '500px', // Adjust size as needed
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <img
                src={robotImg}
                alt="AI Robot Mascot"
                className="robot-image"
                style={{
                    width: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))',
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                    transition: 'transform 0.1s ease-out',
                    willChange: 'transform'
                }}
            />
            {/* Optional: Add glow or shadow element below if needed */}
            <div style={{
                position: 'absolute',
                bottom: '-20px',
                width: '60%',
                height: '20px',
                background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.4) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: -1,
                transform: `translateY(20px) scale(${1 - Math.abs(rotate.x) / 50})` // Dynamic shadow scaling
            }}></div>
        </div>
    );
}
