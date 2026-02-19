package main

import (
	"fmt"
	"backend-api/internal/clients/mpc"
)

func main() {
	// 测试MPC客户端类型定义
	req := &mpc.KeyGenRequest{
		SessionID: "test-session",
		Scheme: mpc.ThresholdScheme{
			TotalParticipants: 3,
			Threshold: 2,
			CurveType: mpc.CurveTypeSecp256k1,
			Protocol: mpc.ProtocolTypeGg18,
		},
		Participants: []string{"node1", "node2", "node3"},
		Metadata: map[string]string{"test": "value"},
	}
	
	fmt.Printf("KeyGenRequest created: %+v\n", req)
	fmt.Println("MPC client types compile successfully!")
}