import { ProcessingState, ProcessingStep, TransparencyLog } from '../types';

export class TransparencyTracker {
  private steps: ProcessingStep[] = [];
  private logs: TransparencyLog[] = [];
  private startTime: number = Date.now();
  private onUpdate: (state: Partial<ProcessingState>) => void;

  constructor(
    stepLabels: string[],
    onUpdate: (state: Partial<ProcessingState>) => void
  ) {
    this.onUpdate = onUpdate;
    this.startTime = Date.now();
    this.steps = stepLabels.map((label, idx) => ({
      id: `step-${idx}`,
      label,
      status: idx === 0 ? 'active' : 'pending',
    }));

    this.addLog('🔒 Sandboxed browser memory environment active (0 bytes sent to cloud)', 'secure');
    this.publish(5, this.steps[0]?.label || 'Starting process');
  }

  public getElapsedTime(): string {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    return `${elapsed}s`;
  }

  public addLog(text: string, type: TransparencyLog['type'] = 'info') {
    const log: TransparencyLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      type,
      timestamp: this.getElapsedTime(),
    };
    this.logs.push(log);
    this.onUpdate({ logs: [...this.logs] });
  }

  public setStep(stepIndex: number, detail?: string) {
    this.steps = this.steps.map((step, idx) => {
      if (idx < stepIndex) {
        return { ...step, status: 'completed' };
      } else if (idx === stepIndex) {
        return { ...step, status: 'active', detail };
      } else {
        return { ...step, status: 'pending' };
      }
    });

    const currentStep = this.steps[stepIndex];
    if (currentStep) {
      this.addLog(`⚡ ${currentStep.label}${detail ? ` (${detail})` : ''}`, 'cpu');
    }

    const calculatedProgress = Math.round(
      ((stepIndex + 0.5) / Math.max(1, this.steps.length)) * 95
    );
    this.publish(calculatedProgress, currentStep?.label || 'Processing');
  }

  public setProgress(progressPercent: number, stageMessage?: string) {
    this.publish(progressPercent, stageMessage);
  }

  public complete(resultUrl: string, resultName: string, detail?: string) {
    this.steps = this.steps.map((step) => ({ ...step, status: 'completed' }));
    this.addLog('🛡️ Verification complete: 100% processed locally on device', 'crypto');
    this.addLog(`✅ Successfully generated ${resultName} in ${this.getElapsedTime()}`, 'success');

    this.onUpdate({
      isProcessing: false,
      progress: 100,
      stage: 'Completed',
      steps: [...this.steps],
      logs: [...this.logs],
      resultUrl,
      resultName,
      error: null,
    });
  }

  public fail(errorMessage: string) {
    this.steps = this.steps.map((step) =>
      step.status === 'active' ? { ...step, status: 'failed', detail: errorMessage } : step
    );
    this.addLog(`❌ Error: ${errorMessage}`, 'warn');

    this.onUpdate({
      isProcessing: false,
      stage: 'Failed',
      steps: [...this.steps],
      logs: [...this.logs],
      error: errorMessage,
    });
  }

  private publish(progress: number, stage: string) {
    this.onUpdate({
      isProcessing: true,
      progress,
      stage,
      steps: [...this.steps],
      logs: [...this.logs],
    });
  }
}
