// components/IndicatorBadge.tsx
import React from 'react'

interface Props {
    name: string
    visible: boolean
    onToggle: () => void
    onRemove: () => void
}

export const IndicatorBadge = ({ name, visible, onToggle, onRemove }: Props) => {
    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 text-white rounded shadow text-sm mt-10">
            <span>{name}</span>
            <button onClick={onToggle}>{visible ? '👁️' : '🚫'}</button>
            <button onClick={onRemove}>❌</button>
        </div>
    )
}
