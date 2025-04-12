'use client';
import { useState, useEffect, useRef } from 'react';
import flight_data from '../../flight_data.json';
import plane from '../assets/images/plane.png';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Image from 'next/image';

const DURATION = 20000;
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 800;

const FlightAnimation = () => {
  const [startAnimation, setStartAnimation] = useState(false);
  const [position, setPosition] = useState({ x: MAX_WIDTH / 2, y: MAX_HEIGHT / 2 });
  const [rotation, setRotation] = useState(0);

  const requestRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentPosRef = useRef({ x: MAX_WIDTH / 2, y: MAX_HEIGHT / 2 });

  const scaledData = flight_data.map((item) => ({
    speed: item.speed * 0.0012,
    direction: item.direction,
  }));

  const reset = () => {
    cancelAnimationFrame(requestRef.current);
    setPosition({ x: MAX_WIDTH / 2, y: MAX_HEIGHT / 2 });
    setRotation(0);
    currentPosRef.current = { x: MAX_WIDTH / 2, y: MAX_HEIGHT / 2 };
    startTimeRef.current = null;
  };

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    const totalSteps = scaledData.length;
    const stepDuration = DURATION / totalSteps;

    const index = Math.floor(elapsed / stepDuration);
    if (index >= totalSteps - 1) {
      reset();
      setStartAnimation(false);
      return;
    }

    const current = scaledData[index];

    const radians = (current.direction * Math.PI) / 180;
    const dx = Math.cos(radians) * current.speed;
    const dy = -Math.sin(radians) * current.speed;

    let newX = currentPosRef.current.x + dx;
    let newY = currentPosRef.current.y + dy;

    currentPosRef.current = { x: newX, y: newY };
    setPosition({ x: newX, y: newY });
    setRotation(current.direction);

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (startAnimation) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      reset();
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [startAnimation]);

  return (
    <div className={styles.container}>
      <button
        onClick={() => setStartAnimation((prev) => !prev)}
        className={clsx(styles.button, startAnimation ? styles.stop : styles.start)}
      >
        {startAnimation ? 'Стоп' : 'Почати'}
      </button>

      <div
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) rotate(${rotation - 90}deg)`,
        }}
        className={styles.plane}
      >
        <Image src={plane} alt="plane icon" width={30} height={30} />
      </div>
    </div>
  );
};

export default FlightAnimation;
