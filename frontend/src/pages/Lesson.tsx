import React, { useEffect, useRef, useState } from 'react';

const Lesson = () => {
    const [predictedSign, setPredictedSign] = useState('');
    const webcamRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Set up WebSocket connection to FastAPI server
        socketRef.current = new WebSocket('ws://localhost:8000/ws');

        socketRef.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        socketRef.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            setPredictedSign(data.predicted_sign);
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const sendFrameToServer = (frame) => {
        if (socketRef.current) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = frame.width;
            canvas.height = frame.height;
            ctx.drawImage(frame, 0, 0);
            canvas.toBlob((blob) => {
                blob.arrayBuffer().then((buffer) => {
                    // Send binary data using WebSocket
                    socketRef.current.send(buffer);
                });
            });
        }
    };

    const startWebcam = async () => {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamRef.current.srcObject = videoStream;

        // Capture frames every 400ms and send to the server
        setInterval(() => {
          if (webcamRef.current) {
              sendFrameToServer(webcamRef.current);
          }
      }, 400);      
    };

    useEffect(() => {
        startWebcam();
    }, []);

    return (
        <div style={{ position: 'relative', textAlign: 'center' }}>
            <video ref={webcamRef} autoPlay width="640" height="480" />
            <h1 style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '24px' }}>
                Predicted Sign: {predictedSign}
            </h1>
        </div>
    );
};

export default Lesson;
