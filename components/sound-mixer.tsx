'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { ambientSounds, soundCategories, type AmbientSound } from '@/lib/sounds';
import { Play, Pause, Volume2 } from 'lucide-react';

// Generate procedural sound using Web Audio API
class ProceduralAudio {
  private ctx: AudioContext | null = null;
  private nodes: Map<string, { source: AudioNode; gain: GainNode }> = new Map();

  private getContext(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  start(soundId: string, volume: number) {
    if (this.nodes.has(soundId)) return;
    const ctx = this.getContext();
    const gain = ctx.createGain();
    gain.gain.value = volume * 0.3;
    gain.connect(ctx.destination);

    let source: AudioNode;

    // Create different sounds based on ID
    if (['rain', 'thunder', 'white-noise', 'brown-noise'].includes(soundId)) {
      // Noise-based sounds
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      if (soundId === 'brown-noise') {
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (last + 0.02 * white) / 1.02;
          last = data[i];
          data[i] *= 3.5;
        }
      } else {
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      if (soundId === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;
      } else if (soundId === 'thunder') {
        filter.type = 'lowpass';
        filter.frequency.value = 400;
      } else if (soundId === 'brown-noise') {
        filter.type = 'lowpass';
        filter.frequency.value = 800;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 8000;
      }

      noiseSource.connect(filter);
      filter.connect(gain);
      noiseSource.start();
      source = noiseSource;
    } else if (['ocean', 'wind'].includes(soundId)) {
      // Oscillating filtered noise
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = soundId === 'ocean' ? 600 : 1200;

      // LFO for wave-like effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = soundId === 'ocean' ? 0.1 : 0.3;
      lfoGain.gain.value = soundId === 'ocean' ? 400 : 600;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      noiseSource.connect(filter);
      filter.connect(gain);
      noiseSource.start();
      source = noiseSource;
    } else if (soundId === 'fire') {
      // Crackling fire - filtered noise with random gain modulation
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
        // Add crackle effect
        if (Math.random() > 0.99) data[i] *= 3;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.3;

      noiseSource.connect(filter);
      filter.connect(gain);
      noiseSource.start();
      source = noiseSource;
    } else if (soundId === 'piano') {
      // Simple piano-like tones
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 261.63; // C4
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.3;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      source = osc;
    } else {
      // Default: gentle filtered noise
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 3000;

      noiseSource.connect(filter);
      filter.connect(gain);
      noiseSource.start();
      source = noiseSource;
    }

    this.nodes.set(soundId, { source, gain });
  }

  stop(soundId: string) {
    const node = this.nodes.get(soundId);
    if (node) {
      try {
        if (node.source instanceof AudioBufferSourceNode) node.source.stop();
        else if (node.source instanceof OscillatorNode) node.source.stop();
      } catch {}
      this.nodes.delete(soundId);
    }
  }

  setVolume(soundId: string, volume: number) {
    const node = this.nodes.get(soundId);
    if (node) node.gain.gain.value = volume * 0.3;
  }

  stopAll() {
    this.nodes.forEach((_, id) => this.stop(id));
  }
}

let audioEngine: ProceduralAudio | null = null;
const getAudioEngine = () => {
  if (!audioEngine) audioEngine = new ProceduralAudio();
  return audioEngine;
};

export function SoundMixer({ className }: { className?: string }) {
  const { activeSounds, volumes, isPlaying, toggleSound, setVolume, setIsPlaying } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('nature');

  // Sync audio with state
  useEffect(() => {
    const engine = getAudioEngine();
    if (isPlaying) {
      activeSounds.forEach(id => engine.start(id, volumes[id] ?? 0.5));
    } else {
      engine.stopAll();
    }
    return () => engine.stopAll();
  }, []);

  const handleToggleSound = (soundId: string) => {
    const engine = getAudioEngine();
    const wasActive = activeSounds.includes(soundId);
    toggleSound(soundId);
    
    if (wasActive) {
      engine.stop(soundId);
    } else if (isPlaying) {
      engine.start(soundId, volumes[soundId] ?? 0.5);
    }
  };

  const handleVolumeChange = (soundId: string, vol: number) => {
    setVolume(soundId, vol);
    getAudioEngine().setVolume(soundId, vol);
  };

  const handlePlayPause = () => {
    const engine = getAudioEngine();
    if (isPlaying) {
      engine.stopAll();
      setIsPlaying(false);
    } else {
      activeSounds.forEach(id => engine.start(id, volumes[id] ?? 0.5));
      setIsPlaying(true);
    }
  };

  const filteredSounds = ambientSounds.filter(s => s.category === activeCategory);

  return (
    <div className={cn('space-y-5', className)}>
      {/* Global play/pause */}
      {activeSounds.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePlayPause}
          className={cn(
            'w-full flex items-center justify-center gap-3 py-3 rounded-2xl transition-all',
            isPlaying
              ? 'bg-primary/20 border border-primary/30 text-primary'
              : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
          )}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span className="text-sm font-medium">
            {isPlaying ? `Reproduciendo ${activeSounds.length} sonido${activeSounds.length > 1 ? 's' : ''}` : 'Reproducir'}
          </span>
        </motion.button>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {soundCategories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all',
              activeCategory === cat.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50')}>
            <span>{cat.icon}</span><span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sound cards */}
      <div className="grid gap-3">
        {filteredSounds.map((sound, i) => {
          const active = activeSounds.includes(sound.id);
          return (
            <motion.div key={sound.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn('glass rounded-2xl p-4 transition-all', active && 'border border-primary/20')}>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleSound(sound.id)}
                  className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all',
                    active ? 'bg-primary/20' : 'bg-secondary/50')}>
                  {sound.icon}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', active ? 'text-primary' : 'text-foreground')}>{sound.name}</p>
                  <p className="text-muted-foreground text-xs">{sound.description}</p>
                </div>
              </div>
              {active && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 flex items-center gap-3">
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input type="range" min="0" max="1" step="0.05" value={volumes[sound.id] ?? 0.5}
                    onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
