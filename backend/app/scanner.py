
import subprocess
import re


def run_command(command):
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=15
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "Command failed")

    return result.stdout


def scan_wifi_networks():

    networks = []
    current_group = None
    current_ap = None

    try:

        # Scan nearby Wi-Fi networks
        output = run_command([
            "netsh",
            "wlan",
            "show",
            "networks",
            "mode=bssid"
        ])

        for line in output.splitlines():

            ssid_match = re.match(
                r"^\s*SSID\s+\d+\s*:\s*(.*)$",
                line,
                re.IGNORECASE
            )

            if ssid_match:

                if current_group is not None:
                    networks.append(current_group)

                current_group = {
                    "ssid": ssid_match.group(1).strip() or "<Hidden SSID>",
                    "authentication": "Unknown",
                    "encryption": "Unknown",
                    "access_points": []
                }

                current_ap = None
                continue

            if current_group is None:
                continue

            auth_match = re.match(
                r"^\s*Authentication\s*:\s*(.*)$",
                line,
                re.IGNORECASE
            )

            if auth_match:
                current_group["authentication"] = auth_match.group(1).strip()
                continue

            encryption_match = re.match(
                r"^\s*Encryption\s*:\s*(.*)$",
                line,
                re.IGNORECASE
            )

            if encryption_match:
                current_group["encryption"] = encryption_match.group(1).strip()
                continue

            bssid_match = re.match(
                r"^\s*BSSID\s+\d+\s*:\s*(.*)$",
                line,
                re.IGNORECASE
            )

            if bssid_match:

                current_ap = {
                    "bssid": bssid_match.group(1).strip(),
                    "signal": None,
                    "radio_type": "Unknown",
                    "channel": None
                }

                current_group["access_points"].append(current_ap)
                continue

            if current_ap is None:
                continue

            signal_match = re.match(
                r"^\s*Signal\s*:\s*(\d+)\s*%",
                line,
                re.IGNORECASE
            )

            if signal_match:
                current_ap["signal"] = int(signal_match.group(1))
                continue

            radio_match = re.match(
                r"^\s*Radio type\s*:\s*(.*)$",
                line,
                re.IGNORECASE
            )

            if radio_match:
                current_ap["radio_type"] = radio_match.group(1).strip()
                continue

            channel_match = re.match(
                r"^\s*Channel\s*:\s*(\d+)",
                line,
                re.IGNORECASE
            )

            if channel_match:
                current_ap["channel"] = int(channel_match.group(1))

        if current_group is not None:
            networks.append(current_group)

        # Convert detected networks into scanner results
        results = []

        for group in networks:

            access_points = group["access_points"]

            if not access_points:
                access_points = [{
                    "bssid": None,
                    "signal": None,
                    "radio_type": "Unknown",
                    "channel": None
                }]

            for ap in access_points:

                results.append({
                    "ssid": group["ssid"],
                    "bssid": ap["bssid"],
                    "signal": ap["signal"],
                    "radio_type": ap["radio_type"],
                    "channel": ap["channel"],
                    "authentication": group["authentication"],
                    "encryption": group["encryption"]
                })

        # Get details of the currently connected Wi-Fi
        interface_output = run_command([
            "netsh",
            "wlan",
            "show",
            "interfaces"
        ])

        connected = {}

        fields = {
            "ssid": "SSID",
            "bssid": "AP BSSID",
            "signal": "Signal",
            "radio_type": "Radio type",
            "channel": "Channel"
        }

        for line in interface_output.splitlines():

            for key, label in fields.items():

                match = re.match(
                    r"^\s*" + re.escape(label) + r"\s*:\s*(.*)$",
                    line,
                    re.IGNORECASE
                )

                if match:
                    connected[key] = match.group(1).strip()

        # Enrich the connected network with interface information
        for network in results:

            if network["ssid"] == connected.get("ssid"):

                if connected.get("bssid"):
                    network["bssid"] = connected["bssid"]

                if connected.get("signal"):
                    signal = re.search(r"\d+", connected["signal"])
                    if signal:
                        network["signal"] = int(signal.group())

                if connected.get("radio_type"):
                    network["radio_type"] = connected["radio_type"]

                if connected.get("channel"):
                    channel = re.search(r"\d+", connected["channel"])
                    if channel:
                        network["channel"] = int(channel.group())

        return results

    except subprocess.TimeoutExpired:
        raise RuntimeError("Wi-Fi scanning timed out")

    except FileNotFoundError:
        raise RuntimeError("Windows netsh command not found")

    except Exception as e:
        raise RuntimeError(f"Wi-Fi scanning error: {e}")
