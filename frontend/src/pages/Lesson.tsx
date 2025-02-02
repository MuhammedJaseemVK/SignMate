import React, { useEffect, useRef, useState } from 'react';

const Lesson = () => {
    const [predictedSign, setPredictedSign] = useState('');
    const webcamRef = useRef(null);
    const socketRef = useRef(null);
    let frameInterval = null;

    useEffect(() => {
        // Setup WebSocket connection
        socketRef.current = new WebSocket('ws://localhost:8000/ws');

        socketRef.current.onopen = () => console.log('WebSocket connected');
        socketRef.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            setPredictedSign(data.predicted_sign);
        };

        socketRef.current.onclose = () => console.log('WebSocket disconnected');

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (frameInterval) {
                clearInterval(frameInterval);
            }
        };
    }, []);

    const sendFrameToServer = async () => {
        if (webcamRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const video = webcamRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                blob.arrayBuffer().then((buffer) => {
                    socketRef.current.send(buffer);
                });
            }, 'image/jpeg', 0.6);  // Compress image for faster transmission
        }
    };

    const startWebcam = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamRef.current.srcObject = stream;

        // Send frames every 300ms for real-time performance
        frameInterval = setInterval(sendFrameToServer, 300);
    };

    useEffect(() => {
        startWebcam();
    }, []);

    return (
        <div style={{ position: 'relative', textAlign: 'center' }}>
            <video ref={webcamRef} autoPlay playsInline width="640" height="480" />
            <h1 style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '24px' }}>
                Predicted Sign: {predictedSign}
            </h1>
        </div>
    );
};

export default Lesson;
