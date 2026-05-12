"""
Test cases for sell-requests and job-applications endpoints
Tests: CRUD operations, status updates, authentication requirements
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthentication:
    """Test authentication for admin endpoints"""
    
    def test_login_admin_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["username"] == "admin"
        print("SUCCESS: Admin login returns JWT token")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("SUCCESS: Invalid credentials returns 401")


class TestSellRequests:
    """Tests for sell-requests endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authentication token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = login_resp.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        yield
        # Cleanup TEST_ records
        try:
            requests_resp = requests.get(f"{BASE_URL}/api/sell-requests", headers=self.headers)
            for req in requests_resp.json():
                if req.get("name", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/sell-requests/{req['id']}", headers=self.headers)
        except:
            pass

    def test_create_sell_request_public(self):
        """Test creating a sell request (public endpoint)"""
        response = requests.post(f"{BASE_URL}/api/sell-requests", json={
            "name": "TEST_Pedro Test",
            "phone": "+18091111111",
            "email": "pedro@test.com",
            "property_description": "Apartamento de prueba",
            "property_type": "Apartamento",
            "location": "Punta Cana"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Pedro Test"
        assert data["phone"] == "+18091111111"
        assert data["status"] == "pending"
        assert "id" in data
        print(f"SUCCESS: Sell request created with ID: {data['id']}")
        return data["id"]

    def test_get_sell_requests_requires_auth(self):
        """Test that GET sell-requests requires authentication"""
        response = requests.get(f"{BASE_URL}/api/sell-requests")
        assert response.status_code in [401, 403]
        print("SUCCESS: GET /sell-requests requires authentication")

    def test_get_sell_requests_with_auth(self):
        """Test GET sell-requests with authentication"""
        response = requests.get(f"{BASE_URL}/api/sell-requests", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} sell requests")

    def test_update_sell_request_status(self):
        """Test updating sell request status"""
        # First create a request
        create_resp = requests.post(f"{BASE_URL}/api/sell-requests", json={
            "name": "TEST_Status Test",
            "phone": "+18092222222",
            "property_description": "Test"
        })
        request_id = create_resp.json()["id"]
        
        # Update status to contacted
        response = requests.put(
            f"{BASE_URL}/api/sell-requests/{request_id}/status?status=contacted",
            headers=self.headers
        )
        assert response.status_code == 200
        print("SUCCESS: Status updated to 'contacted'")
        
        # Verify status changed
        get_resp = requests.get(f"{BASE_URL}/api/sell-requests", headers=self.headers)
        for req in get_resp.json():
            if req["id"] == request_id:
                assert req["status"] == "contacted"
                break
        print("SUCCESS: Verified status change persisted")

    def test_update_sell_request_invalid_status(self):
        """Test updating sell request with invalid status"""
        # First create a request
        create_resp = requests.post(f"{BASE_URL}/api/sell-requests", json={
            "name": "TEST_Invalid Status",
            "phone": "+18093333333",
            "property_description": "Test"
        })
        request_id = create_resp.json()["id"]
        
        # Try invalid status
        response = requests.put(
            f"{BASE_URL}/api/sell-requests/{request_id}/status?status=invalid_status",
            headers=self.headers
        )
        assert response.status_code == 400
        print("SUCCESS: Invalid status returns 400")

    def test_delete_sell_request(self):
        """Test deleting sell request"""
        # First create a request
        create_resp = requests.post(f"{BASE_URL}/api/sell-requests", json={
            "name": "TEST_Delete Test",
            "phone": "+18094444444",
            "property_description": "To be deleted"
        })
        request_id = create_resp.json()["id"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/api/sell-requests/{request_id}", headers=self.headers)
        assert response.status_code == 200
        print("SUCCESS: Sell request deleted")
        
        # Verify it's gone
        get_resp = requests.get(f"{BASE_URL}/api/sell-requests", headers=self.headers)
        ids = [r["id"] for r in get_resp.json()]
        assert request_id not in ids
        print("SUCCESS: Verified sell request no longer exists")


class TestJobApplications:
    """Tests for job-applications endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authentication token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = login_resp.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        yield
        # Cleanup TEST_ records
        try:
            apps_resp = requests.get(f"{BASE_URL}/api/job-applications", headers=self.headers)
            for app in apps_resp.json():
                if app.get("name", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/job-applications/{app['id']}", headers=self.headers)
        except:
            pass

    def test_create_job_application_public(self):
        """Test creating a job application (public endpoint)"""
        response = requests.post(f"{BASE_URL}/api/job-applications", json={
            "name": "TEST_Laura Test",
            "phone": "+18095555555",
            "email": "laura@test.com",
            "position": "Marketing",
            "message": "Quiero trabajar con ustedes",
            "linkedin_url": "https://linkedin.com/in/lauratest"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Laura Test"
        assert data["email"] == "laura@test.com"
        assert data["status"] == "pending"
        assert "id" in data
        print(f"SUCCESS: Job application created with ID: {data['id']}")

    def test_get_job_applications_requires_auth(self):
        """Test that GET job-applications requires authentication"""
        response = requests.get(f"{BASE_URL}/api/job-applications")
        assert response.status_code in [401, 403]
        print("SUCCESS: GET /job-applications requires authentication")

    def test_get_job_applications_with_auth(self):
        """Test GET job-applications with authentication"""
        response = requests.get(f"{BASE_URL}/api/job-applications", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Got {len(data)} job applications")

    def test_update_job_application_status(self):
        """Test updating job application status"""
        # First create an application
        create_resp = requests.post(f"{BASE_URL}/api/job-applications", json={
            "name": "TEST_Status Test Job",
            "phone": "+18096666666",
            "email": "statustest@test.com"
        })
        app_id = create_resp.json()["id"]
        
        # Update status to reviewed
        response = requests.put(
            f"{BASE_URL}/api/job-applications/{app_id}/status?status=reviewed",
            headers=self.headers
        )
        assert response.status_code == 200
        print("SUCCESS: Status updated to 'reviewed'")
        
        # Verify status changed
        get_resp = requests.get(f"{BASE_URL}/api/job-applications", headers=self.headers)
        for app in get_resp.json():
            if app["id"] == app_id:
                assert app["status"] == "reviewed"
                break
        print("SUCCESS: Verified status change persisted")

    def test_update_job_application_all_statuses(self):
        """Test all valid job application statuses"""
        # First create an application
        create_resp = requests.post(f"{BASE_URL}/api/job-applications", json={
            "name": "TEST_All Statuses",
            "phone": "+18097777777",
            "email": "allstatus@test.com"
        })
        app_id = create_resp.json()["id"]
        
        valid_statuses = ["pending", "reviewed", "interviewed", "hired", "rejected"]
        for status in valid_statuses:
            response = requests.put(
                f"{BASE_URL}/api/job-applications/{app_id}/status?status={status}",
                headers=self.headers
            )
            assert response.status_code == 200
            print(f"SUCCESS: Status '{status}' is valid")

    def test_update_job_application_invalid_status(self):
        """Test updating job application with invalid status"""
        create_resp = requests.post(f"{BASE_URL}/api/job-applications", json={
            "name": "TEST_Invalid Status Job",
            "phone": "+18098888888",
            "email": "invalid@test.com"
        })
        app_id = create_resp.json()["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/job-applications/{app_id}/status?status=invalid_status",
            headers=self.headers
        )
        assert response.status_code == 400
        print("SUCCESS: Invalid status returns 400")

    def test_delete_job_application(self):
        """Test deleting job application"""
        # First create an application
        create_resp = requests.post(f"{BASE_URL}/api/job-applications", json={
            "name": "TEST_Delete Test Job",
            "phone": "+18099999999",
            "email": "delete@test.com"
        })
        app_id = create_resp.json()["id"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/api/job-applications/{app_id}", headers=self.headers)
        assert response.status_code == 200
        print("SUCCESS: Job application deleted")
        
        # Verify it's gone
        get_resp = requests.get(f"{BASE_URL}/api/job-applications", headers=self.headers)
        ids = [a["id"] for a in get_resp.json()]
        assert app_id not in ids
        print("SUCCESS: Verified job application no longer exists")


class TestWhatsAppIntegration:
    """Test WhatsApp notification functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authentication token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = login_resp.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_notifications_endpoint(self):
        """Test notifications endpoint exists and requires auth"""
        # Without auth
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code in [401, 403]
        
        # With auth
        response = requests.get(f"{BASE_URL}/api/notifications", headers=self.headers)
        assert response.status_code == 200
        print("SUCCESS: Notifications endpoint accessible with auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
