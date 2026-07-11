"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Calculator,
  IndianRupee,
  Clock,
  Percent,
} from "lucide-react";

interface EMICalculatorProps {
  propertyPrice: number;
}

export default function EMICalculator({
                                        propertyPrice,
                                      }: EMICalculatorProps) {
  const [
    downPayment,
    setDownPayment,
  ] = useState(
      propertyPrice * 0.2
  );

  const [
    interestRate,
    setInterestRate,
  ] = useState(8.5);

  const [tenure, setTenure] =
      useState(20);

  const loanAmount = useMemo(() => {
    return Math.max(
        propertyPrice -
        downPayment,
        0
    );
  }, [
    propertyPrice,
    downPayment,
  ]);

  const emi = useMemo(() => {
    const monthlyRate =
        interestRate /
        12 /
        100;

    const numberOfMonths =
        tenure * 12;

    if (
        loanAmount <= 0 ||
        monthlyRate <= 0 ||
        numberOfMonths <= 0
    ) {
      return 0;
    }

    const growthFactor =
        Math.pow(
            1 + monthlyRate,
            numberOfMonths
        );

    const value =
        (
            loanAmount *
            monthlyRate *
            growthFactor
        ) /
        (growthFactor - 1);

    return Math.round(value);
  }, [
    loanAmount,
    interestRate,
    tenure,
  ]);

  const totalPayable =
      emi * tenure * 12;

  const totalInterest =
      Math.max(
          totalPayable -
          loanAmount,
          0
      );

  const formatCurrency = (
      value: number
  ) => {
    return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }
    ).format(value);
  };

  return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator
                size={22}
                className="text-primary"
            />
            EMI Calculator
          </h3>

          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Estimated Monthly EMI
            </p>

            <p className="text-2xl font-black text-primary tracking-tight">
              {formatCurrency(
                  emi
              )}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <IndianRupee
                      size={
                        12
                      }
                  />
                  Down Payment
                </label>

                <span className="text-sm font-black text-gray-900">
                                {formatCurrency(
                                    downPayment
                                )}
                            </span>
              </div>

              <input
                  type="range"
                  min={0}
                  max={
                    propertyPrice
                  }
                  step={
                    100000
                  }
                  value={
                    downPayment
                  }
                  onChange={(
                      event
                  ) =>
                      setDownPayment(
                          Number(
                              event
                                  .target
                                  .value
                          )
                      )
                  }
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />

              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                            <span>
                                0%
                            </span>
                <span>
                                100%
                            </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Percent
                      size={
                        12
                      }
                  />
                  Interest Rate
                </label>

                <span className="text-sm font-black text-gray-900">
                                {
                                  interestRate
                                }
                  %
                            </span>
              </div>

              <input
                  type="range"
                  min={5}
                  max={15}
                  step={0.1}
                  value={
                    interestRate
                  }
                  onChange={(
                      event
                  ) =>
                      setInterestRate(
                          Number(
                              event
                                  .target
                                  .value
                          )
                      )
                  }
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />

              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                            <span>
                                5%
                            </span>
                <span>
                                15%
                            </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Clock
                      size={
                        12
                      }
                  />
                  Loan Tenure
                </label>

                <span className="text-sm font-black text-gray-900">
                                {tenure}{" "}
                  Years
                            </span>
              </div>

              <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={
                    tenure
                  }
                  onChange={(
                      event
                  ) =>
                      setTenure(
                          Number(
                              event
                                  .target
                                  .value
                          )
                      )
                  }
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />

              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                            <span>
                                1 Yr
                            </span>
                <span>
                                30 Yrs
                            </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[2rem] p-6 flex flex-col justify-between border border-gray-100">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                            <span className="text-xs font-bold text-gray-500">
                                Loan Amount
                            </span>

                <span className="text-sm font-black text-gray-900">
                                {formatCurrency(
                                    loanAmount
                                )}
                            </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                            <span className="text-xs font-bold text-gray-500">
                                Total Interest
                            </span>

                <span className="text-sm font-black text-gray-900">
                                {formatCurrency(
                                    totalInterest
                                )}
                            </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                            <span className="text-xs font-bold text-gray-500">
                                Total Payable
                            </span>

                <span className="text-sm font-black text-gray-900">
                                {formatCurrency(
                                    totalPayable
                                )}
                            </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 font-medium italic text-center">
          * This is an estimated
          value. Actual EMI may vary
          based on bank terms and
          conditions.
        </p>
      </div>
  );
}