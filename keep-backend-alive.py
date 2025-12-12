#!/usr/bin/env python3
"""
Keep Cortex Backend Running - Health Monitor & Auto-Restart
"""

import time
import requests
import subprocess
import sys
import os
from datetime import datetime
import signal
import threading

class BackendMonitor:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.health_endpoint = f"{self.backend_url}/health"
        self.check_interval = 30  # seconds
        self.restart_delay = 5    # seconds
        self.max_restart_attempts = 3
        self.restart_count = 0
        self.backend_process = None
        self.running = True
        
    def log(self, message):
        """Log with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def check_health(self):
        """Check if backend is healthy"""
        try:
            response = requests.get(self.health_endpoint, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    return True
            return False
        except Exception as e:
            self.log(f"Health check failed: {str(e)}")
            return False
    
    def start_backend(self):
        """Start the backend process"""
        try:
            self.log("Starting Cortex backend...")
            
            # Kill any existing process on port 8000
            self.kill_process_on_port(8000)
            time.sleep(2)
            
            # Start new backend process
            cmd = [
                sys.executable, "-m", "uvicorn", 
                "cortex.main:app", 
                "--host", "0.0.0.0", 
                "--port", "8000",
                "--reload"
            ]
            
            self.backend_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.getcwd()
            )
            
            # Wait for startup
            self.log("Waiting for backend to start...")
            time.sleep(10)
            
            # Verify it started
            if self.check_health():
                self.log("✅ Backend started successfully!")
                self.restart_count = 0
                return True
            else:
                self.log("❌ Backend failed to start properly")
                return False
                
        except Exception as e:
            self.log(f"❌ Failed to start backend: {str(e)}")
            return False
    
    def kill_process_on_port(self, port):
        """Kill any process running on the specified port"""
        try:
            if os.name == 'nt':  # Windows
                cmd = f'netstat -ano | findstr :{port}'
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                if result.stdout:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        if 'LISTENING' in line:
                            pid = line.split()[-1]
                            subprocess.run(f'taskkill /F /PID {pid}', shell=True)
                            self.log(f"Killed process {pid} on port {port}")
            else:  # Unix/Linux/Mac
                cmd = f'lsof -ti:{port}'
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                if result.stdout:
                    pids = result.stdout.strip().split('\n')
                    for pid in pids:
                        if pid:
                            subprocess.run(['kill', '-9', pid])
                            self.log(f"Killed process {pid} on port {port}")
        except Exception as e:
            self.log(f"Error killing process on port {port}: {str(e)}")
    
    def restart_backend(self):
        """Restart the backend"""
        if self.restart_count >= self.max_restart_attempts:
            self.log(f"❌ Max restart attempts ({self.max_restart_attempts}) reached. Stopping monitor.")
            return False
            
        self.restart_count += 1
        self.log(f"🔄 Restarting backend (attempt {self.restart_count}/{self.max_restart_attempts})")
        
        # Stop current process
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
            except:
                try:
                    self.backend_process.kill()
                except:
                    pass
        
        time.sleep(self.restart_delay)
        return self.start_backend()
    
    def monitor_loop(self):
        """Main monitoring loop"""
        self.log("🚀 Starting Cortex Backend Monitor")
        self.log(f"Health check URL: {self.health_endpoint}")
        self.log(f"Check interval: {self.check_interval} seconds")
        
        # Initial start
        if not self.check_health():
            self.log("Backend not running, starting...")
            if not self.start_backend():
                self.log("❌ Failed to start backend initially")
                return
        else:
            self.log("✅ Backend already running and healthy")
        
        # Monitor loop
        while self.running:
            try:
                time.sleep(self.check_interval)
                
                if not self.check_health():
                    self.log("❌ Backend health check failed")
                    if not self.restart_backend():
                        break
                else:
                    self.log("✅ Backend healthy")
                    
            except KeyboardInterrupt:
                self.log("🛑 Monitor stopped by user")
                break
            except Exception as e:
                self.log(f"❌ Monitor error: {str(e)}")
                time.sleep(5)
    
    def stop(self):
        """Stop the monitor and backend"""
        self.running = False
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
            except:
                try:
                    self.backend_process.kill()
                except:
                    pass
        self.log("🛑 Backend monitor stopped")

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("\n🛑 Shutting down backend monitor...")
    monitor.stop()
    sys.exit(0)

if __name__ == "__main__":
    monitor = BackendMonitor()
    
    # Handle shutdown signals
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        monitor.monitor_loop()
    except Exception as e:
        print(f"❌ Monitor crashed: {str(e)}")
        monitor.stop()
        sys.exit(1)