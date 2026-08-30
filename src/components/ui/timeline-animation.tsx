'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TimelineContentProps {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  animationNum?: number;
  customVariants?: Variants;
  timelineRef?: React.RefObject<HTMLElement>;
}

export const TimelineContent: React.FC<TimelineContentProps> = ({
  as: Component = 'div',
  className = '',
  children,
  animationNum = 0,
  customVariants,
  ...props
}) => {
  const defaultVariants: Variants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
    hidden: {
      filter: 'blur(8px)',
      y: -15,
      opacity: 0,
    },
  };

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={animationNum}
      variants={customVariants || defaultVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
