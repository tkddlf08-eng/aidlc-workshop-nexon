interface CountdownTimerProps {
  seconds: number;
}

export function CountdownTimer({ seconds }: CountdownTimerProps) {
  return (
    <span className="text-sm text-gray-400" data-testid="countdown-timer">
      {seconds}초 후 메뉴 화면으로 이동합니다
    </span>
  );
}
