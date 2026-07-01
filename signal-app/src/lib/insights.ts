import type { Insight, InsightSeverity, ReadinessScore } from '../types'
import { generateId } from './localStore'

function severityForStatus(status: ReadinessScore['status']): InsightSeverity {
  if (status === 'green') return 'positive'
  if (status === 'amber') return 'warning'
  return 'critical'
}

/**
 * Turns a readiness score into the explainable insight format required by
 * docs/technical/02-rules-engine.md: every recommendation must expose its
 * top drivers, the rule that triggered it and its data confidence.
 */
export function generateReadinessInsight(userId: string, readiness: ReadinessScore): Insight {
  const topPositive = readiness.positiveDrivers[0]
  const topNegative = readiness.negativeDrivers[0]

  const explanationParts = [`Readiness is ${readiness.score}/100 (${readiness.status}).`]
  if (topPositive) explanationParts.push(`Biggest positive driver: ${topPositive}.`)
  if (topNegative) explanationParts.push(`Biggest negative driver: ${topNegative}.`)
  if (readiness.confidence !== 'high') {
    explanationParts.push(`Confidence is ${readiness.confidence} because some inputs are missing today.`)
  }

  return {
    id: generateId(),
    userId,
    date: readiness.date,
    category: 'readiness',
    severity: severityForStatus(readiness.status),
    title: `Readiness: ${readiness.score}/100 (${readiness.status})`,
    explanation: explanationParts.join(' '),
    recommendedAction: readiness.recommendation,
    dataUsed: [...readiness.positiveDrivers, ...readiness.negativeDrivers],
    confidence: readiness.confidence,
  }
}

/** One insight per rule the readiness engine actually triggered, so each is independently explainable. */
export function generateDriverInsights(userId: string, readiness: ReadinessScore): Insight[] {
  return readiness.triggeredRules.map((rule) => ({
    id: generateId(),
    userId,
    date: readiness.date,
    category: 'training',
    severity: severityForStatus(readiness.status),
    title: rule,
    explanation: `This rule contributed to today's readiness recommendation: ${readiness.recommendation}`,
    recommendedAction: readiness.recommendation,
    dataUsed: [...readiness.positiveDrivers, ...readiness.negativeDrivers],
    confidence: readiness.confidence,
  }))
}

export function generateInsightsForReadiness(userId: string, readiness: ReadinessScore): Insight[] {
  return [generateReadinessInsight(userId, readiness), ...generateDriverInsights(userId, readiness)]
}
