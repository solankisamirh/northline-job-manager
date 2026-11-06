import type { QuoteStatus } from "../types/quoteRequest"

type StatusBadgeProps = {
    status: QuoteStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    return <span className={`badge badge-${status.toLocaleLowerCase()}`}>{status}</span>
}