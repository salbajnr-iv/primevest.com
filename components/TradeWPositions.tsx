"use client";

import * as React from "react";

import { usePositions, type Position } from '@/hooks/usePositions';
import { useAuth } from '@/contexts/AuthContext';

const TradeWPositions: React.FC = () => {
  const { user } = useAuth();
  const
