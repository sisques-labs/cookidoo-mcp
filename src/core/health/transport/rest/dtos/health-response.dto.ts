/** Payload returned by the liveness probe. */
export class HealthResponseDto {
  status!: string;
  timestamp!: string;
}
