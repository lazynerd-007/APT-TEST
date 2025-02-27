import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Flex,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  Badge,
  Button,
  useToast,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaGraduationCap, 
  FaClipboardCheck, 
  FaEnvelope, 
  FaPhone,
  FaBuilding,
  FaArrowLeft
} from 'react-icons/fa';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import CandidateSkillProfile from '@/components/candidates/CandidateSkillProfile';
import usersService from '@/services/usersService';

interface Candidate {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
  organization: {
    id: string;
    name: string;
  };
  profile_image?: string;
  created_at: string;
}

const CandidateProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const candidateData = await usersService.getUser(id as string);
        setCandidate(candidateData);
      } catch (error) {
        console.error('Error fetching candidate:', error);
        setError('Failed to load candidate data. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load candidate data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidate();
  }, [id, toast]);
  
  const handleBackClick = () => {
    router.push('/candidates');
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <Flex justify="center" align="center" height="500px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </DashboardLayout>
    );
  }
  
  if (error || !candidate) {
    return (
      <DashboardLayout>
        <Box p={4}>
          <Button 
            leftIcon={<FaArrowLeft />} 
            variant="ghost" 
            mb={4}
            onClick={handleBackClick}
          >
            Back to Candidates
          </Button>
          
          <Box 
            p={8} 
            textAlign="center" 
            borderWidth={1} 
            borderRadius="md"
          >
            <Heading size="md" mb={4}>Error Loading Candidate</Heading>
            <Text>{error || 'Candidate not found'}</Text>
            <Button 
              mt={4} 
              colorScheme="blue" 
              onClick={() => router.reload()}
            >
              Retry
            </Button>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <Box p={4}>
        <Button 
          leftIcon={<FaArrowLeft />} 
          variant="ghost" 
          mb={4}
          onClick={handleBackClick}
        >
          Back to Candidates
        </Button>
        
        <Box 
          p={6} 
          mb={6} 
          bg={bgColor} 
          borderWidth="1px" 
          borderColor={borderColor} 
          borderRadius="md"
          boxShadow="sm"
        >
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'center', md: 'flex-start' }}
            justify="space-between"
          >
            <Flex align="center" mb={{ base: 4, md: 0 }}>
              <Avatar 
                size="xl" 
                name={`${candidate.first_name} ${candidate.last_name}`} 
                src={candidate.profile_image} 
                mr={6}
              />
              
              <Box>
                <Heading size="lg">
                  {candidate.first_name} {candidate.last_name}
                </Heading>
                <Badge colorScheme="blue" mt={1}>
                  Candidate
                </Badge>
                
                <Flex mt={4} align="center">
                  <FaEnvelope color="gray" />
                  <Text ml={2}>{candidate.email}</Text>
                </Flex>
                
                {candidate.phone_number && (
                  <Flex mt={2} align="center">
                    <FaPhone color="gray" />
                    <Text ml={2}>{candidate.phone_number}</Text>
                  </Flex>
                )}
                
                <Flex mt={2} align="center">
                  <FaBuilding color="gray" />
                  <Text ml={2}>{candidate.organization.name}</Text>
                </Flex>
              </Box>
            </Flex>
            
            <Flex 
              direction="column" 
              align={{ base: 'center', md: 'flex-end' }}
            >
              <Button 
                leftIcon={<FaEnvelope />} 
                colorScheme="blue" 
                mb={2}
                onClick={() => window.location.href = `mailto:${candidate.email}`}
              >
                Contact
              </Button>
              
              <Text fontSize="sm" color="gray.500" mt={2}>
                Joined {new Date(candidate.created_at).toLocaleDateString()}
              </Text>
            </Flex>
          </Flex>
        </Box>
        
        <Tabs colorScheme="blue" isLazy>
          <TabList>
            <Tab>
              <Flex align="center">
                <FaGraduationCap style={{ marginRight: '8px' }} />
                Skills
              </Flex>
            </Tab>
            <Tab>
              <Flex align="center">
                <FaClipboardCheck style={{ marginRight: '8px' }} />
                Assessments
              </Flex>
            </Tab>
            <Tab>
              <Flex align="center">
                <FaUser style={{ marginRight: '8px' }} />
                Profile
              </Flex>
            </Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <CandidateSkillProfile candidateId={candidate.id} />
            </TabPanel>
            
            <TabPanel>
              <Box 
                p={6} 
                bg={bgColor} 
                borderWidth="1px" 
                borderColor={borderColor} 
                borderRadius="md"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>Assessment History</Heading>
                <Divider mb={4} />
                
                <Text>
                  Assessment history component would be displayed here.
                </Text>
              </Box>
            </TabPanel>
            
            <TabPanel>
              <Box 
                p={6} 
                bg={bgColor} 
                borderWidth="1px" 
                borderColor={borderColor} 
                borderRadius="md"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>Candidate Profile</Heading>
                <Divider mb={4} />
                
                <Text>
                  Additional candidate profile information would be displayed here.
                </Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </DashboardLayout>
  );
};

export default CandidateProfilePage; 