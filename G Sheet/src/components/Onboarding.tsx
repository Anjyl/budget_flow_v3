import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileSpreadsheet, ArrowRight, Lightbulb } from "lucide-react";
import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Budget Flow",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Let's get your budget tracking set up! We'll guide you through creating or selecting a Google Sheet with your financial data.
          </p>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Connect to Google Sheets</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Track income and expenses</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Monitor budgets by category</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Sheet Structure",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Your Google Sheet should have specific columns for transactions. Here's what we expect:
          </p>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">For Transactions sheet:</h4>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="secondary">Type (income/expense)</Badge>
                <Badge variant="secondary">Amount</Badge>
                <Badge variant="secondary">Date</Badge>
                <Badge variant="secondary">Description</Badge>
                <Badge variant="secondary">Category</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">For Budget sheet (optional):</h4>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="secondary">Category</Badge>
                <Badge variant="secondary">Limit</Badge>
                <Badge variant="secondary">Spent</Badge>
                <Badge variant="secondary">Remaining</Badge>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Tip</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can have multiple sheets in your spreadsheet. We'll automatically detect and use sheets named "Transactions" and "Budget".
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Choose Your Sheet",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Now let's select or create a Google Sheet to use for your budget data.
          </p>

          <div className="space-y-3">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">Use existing sheet</p>
                    <p className="text-sm text-muted-foreground">
                      Select from your Google Drive spreadsheets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">Create template</p>
                    <p className="text-sm text-muted-foreground">
                      We'll help you create a properly formatted sheet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? "bg-primary"
                      : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[currentStep].content}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={nextStep} className="gap-2">
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}