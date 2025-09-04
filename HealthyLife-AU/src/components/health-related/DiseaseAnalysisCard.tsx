import React, { useState } from 'react'

interface DiseaseData {
  results: {
    [diseaseName: string]: {
      baseline_total_daly: number
      risk_contributions: {
        [riskFactor: string]: {
          attrib_daly: number
          share: number
        }
      }
      projections: {
        [riskFactor: string]: {
          scaled_attrib_daly: number
          scaled_share: number
          potential_reduction_pct: number
        }
      }
    }
  }
}

interface Props {
  diseaseData: DiseaseData | null
  loading?: boolean
  error?: string | null
}

const DiseaseAnalysisCard: React.FC<Props> = ({ diseaseData, loading, error }) => {
  const getRiskLevel = (daly: number) => {
    if (daly < 20000) return { label: 'Low risk', color: 'bg-green-100 text-green-800' }
    if (daly < 100000) return { label: 'Moderate risk', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'High risk', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        Disease Risk Assessment
      </h3>

      {diseaseData ? (
        <div className="space-y-6">
          {Object.entries(diseaseData.results).map(([disease, details]) => {
            const risk = getRiskLevel(details.baseline_total_daly)

            return (
              <div key={disease} className="p-4 border rounded-lg bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-800">{disease}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${risk.color}`}>
                    {risk.label}
                  </span>
                </div>

                {/* Baseline DALY */}
                <p className="text-sm text-gray-600 mb-2">
                  Baseline DALY burden: <span className="font-medium">{details.baseline_total_daly.toLocaleString()}</span>
                </p>

                {/* Risk contributions */}
                <div className="space-y-2">
                  {Object.entries(details.risk_contributions).map(([factor, contrib], index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{factor}</span>
                        <span className="text-sm text-gray-600">{(contrib.share * 100).toFixed(1)}%</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${Math.min(100, contrib.share * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : loading ? (
        <p className="text-gray-600">Loading disease analysis...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <p className="text-gray-600">Complete the health assessment to see your disease risks</p>
      )}
    </div>
  )
}

export default DiseaseAnalysisCard
