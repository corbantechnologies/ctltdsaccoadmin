import React from "react";
import { Card, Flex, Text } from "@radix-ui/themes";
import { Wallet } from "lucide-react";

const SavingTypesCountCard = ({ count }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <Flex direction="column" gap="2">
      <Flex align="center" gap="2">
        <Wallet className="h-6 w-6 " />
        <Text size="5" weight="bold" style={{ color: '#ea1315' }}>
          Savings Types
        </Text>
      </Flex>
      <Text size="6" weight="bold">
        {count}
      </Text>
    </Flex>
  </Card>
);

export default SavingTypesCountCard;
