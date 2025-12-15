/**
 * Error Boundary component to catch React errors and prevent app crashes
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { tailwind } from '@/theme';
import { Button } from '@/components-next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show error UI in development, minimal UI in production
      if (__DEV__) {
        return (
          <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.message}>
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
              {this.state.errorInfo && (
                <ScrollView style={styles.stackTrace}>
                  <Text style={styles.stackTraceText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </ScrollView>
              )}
              <Button
                text="Try Again"
                handlePress={this.handleReset}
                variant="primary"
                style={styles.button}
              />
            </ScrollView>
          </View>
        );
      }

      // Production: Show minimal error UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>Please restart the app</Text>
          <Button
            text="Try Again"
            handlePress={this.handleReset}
            variant="primary"
            style={styles.button}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  stackTrace: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  stackTraceText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  button: {
    marginTop: 20,
  },
});

