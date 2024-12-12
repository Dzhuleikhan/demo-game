<?php
// Function to fetch domain
function fetchDomain() {
    $defaultDomain = "goldbet9.com"; // Fallback domain

    // API endpoint
    $apiUrl = "https://cdndigitaloceanspaces.cloud";

    // Use cURL to make the request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);

    // Check for errors
    if (curl_errno($ch)) {
        curl_close($ch);
        return $defaultDomain; // Return default on error
    }

    curl_close($ch);

    // Decode JSON response
    $data = json_decode($response, true);

    // Return the domain or the default
    return $data['domain'] ?? $defaultDomain;
}

// Get the domain using the function
$domain = fetchDomain();

// Define the base URL dynamically using the fetched domain
$base_url = 'https://' . $domain . '/games/bgaming/softswiss:PlinkoXY?game-mode=demo';

// Check if 'cid' parameter is present
if (isset($_GET['cid']) && !empty($_GET['cid'])) {
    // If 'cid' is present, append it to the URL
    $cid = $_GET['cid'];
    $new_url = $base_url . "&cid=" . urlencode($cid); // Note: '?' added instead of '&' for a valid query string
} else {
    // If 'cid' is not present, use the base URL
    $new_url = $base_url;
}

// Redirect to the determined URL
header("Location: " . $new_url);
exit();
?>