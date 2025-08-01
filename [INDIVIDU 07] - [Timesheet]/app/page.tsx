import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Brain, BarChart3, Download, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            Timesheet AI Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your work hours, analyze productivity patterns, and get AI-powered insights 
            to optimize your workflow and maintain work-life balance.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/timesheet">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/timesheet/dashboard">View Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Easy Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Simple and intuitive interface to log your daily activities with categories and descriptions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Brain className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get intelligent analysis of your work patterns and personalized recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Visual Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Beautiful charts and statistics to understand your productivity distribution.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Download className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Export & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Export your timesheet data to CSV and share insights with your team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold">Log Your Activities</h3>
            <p className="text-gray-600">
              Add your daily work activities with start/end times, categories, and descriptions.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold">AI Analysis</h3>
            <p className="text-gray-600">
              Our AI analyzes your patterns and provides insights on productivity and work-life balance.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold">Optimize & Improve</h3>
            <p className="text-gray-600">
              Use the insights to optimize your schedule and improve your productivity.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Zap className="h-16 w-16 mx-auto text-yellow-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start tracking your time today and get AI-powered insights to work smarter, not harder.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/timesheet">Start Free Today</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Timesheet AI Assistant. Built with Next.js and AI.</p>
        </div>
      </footer>
    </div>
  );
} 