
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, MapPin, X, Image, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ReportForm = () => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState({
    area: '',
    ward: '',
    landmark: '',
    pincode: '',
    panchayat: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to report an issue',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to report an issue',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload images to Supabase Storage
      const imageUrls = [];
      
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('issues')
            .upload(filePath, image);
            
          if (uploadError) {
            throw new Error(`Error uploading image: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('issues')
            .getPublicUrl(filePath);
            
          imageUrls.push({
            url: publicUrlData.publicUrl,
            name: image.name,
            size: image.size,
          });
        }
      }
      
      // Save issue data to Supabase
      const { error: issueError } = await supabase
        .from('issues')
        .insert({
          user_id: user.id,
          description,
          location,
          area: address.area,
          ward: address.ward,
          landmark: address.landmark,
          pincode: address.pincode,
          panchayat: address.panchayat,
          images: imageUrls,
        });
        
      if (issueError) {
        throw new Error(`Error saving issue: ${issueError.message}`);
      }
      
      toast({
        title: 'Report submitted successfully!',
        description: 'Your issue has been reported. Thank you for helping improve your community.',
      });
      
      // Redirect to issues page after a brief delay
      setTimeout(() => {
        navigate('/issues');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error submitting report',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast({
        title: "Maximum images exceeded",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }

    // Add new images to the state
    setImages((prevImages) => [...prevImages, ...files]);

    // Create previews for the new images
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prevPreviews) => [...prevPreviews, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  // Fetch detailed address using coordinates (Nominatim API)
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      console.log('Nominatim API Response:', data);

      if (data.address) {
        // Set the formatted location string
        const locationString = [
          data.address.road,
          data.address.suburb || data.address.neighbourhood,
          data.address.city || data.address.town,
          data.address.state,
          data.address.postcode
        ].filter(Boolean).join(', ');
        
        setLocation(locationString);
        
        // Automatically populate area based on suburb or neighbourhood
        const areaValue = data.address.suburb || data.address.neighbourhood || '';
        
        return {
          area: areaValue,
          ward: data.address.city_district || '',
          landmark: data.address.road || '',
          pincode: data.address.postcode || '',
          panchayat: data.address.village || data.address.town || '',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  // Get current location using the Geolocation API
  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Coordinates:', { latitude, longitude });

          // Simulate loading state
          toast({
            title: "Fetching your location",
            description: "Please wait while we determine your address...",
          });

          // Fetch detailed address using coordinates
          const addressDetails = await getAddressFromCoordinates(latitude, longitude);
          if (addressDetails) {
            console.log('Address Details:', addressDetails);
            setAddress(addressDetails); // Populate address fields
            
            toast({
              title: "Location detected",
              description: "Your address fields have been automatically filled.",
            });
          } else {
            toast({
              title: "Location detection failed",
              description: "Unable to fetch address for your location. Please fill in manually.",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching location:', error);
          toast({
            title: "Location access denied",
            description: "Please enable location services or fill in address manually.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services. Please fill in address manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-xl border-none shadow-card animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Report an Issue</CardTitle>
        <CardDescription className="text-center">
          Help us build a better community by reporting local issues.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-3">
            {imagePreviews.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={preview} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {imagePreviews.length < 5 && (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg aspect-square cursor-pointer hover:bg-gray-50 transition-colors">
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Add More</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="min-h-[120px] resize-none focus:ring-civilink-blue"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 mb-2">Upload images of the issue</p>
                <p className="text-xs text-gray-400 mb-4">(Maximum 5 images)</p>
                
                <label className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-civilink-blue text-white cursor-pointer hover:bg-civilink-darkBlue transition-colors">
                  <span>Select Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          
          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Location Information</h3>
            </div>
            
            {/* Automatic Location Field */}
            <div className="relative">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your current location"
                className="pr-24 focus:ring-civilink-blue"
              />
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                className="absolute right-1 top-1 h-8 inline-flex items-center gap-1 text-xs"
                onClick={getCurrentLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>Get Location</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Input
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  placeholder="Area"
                  className="focus:ring-civilink-blue"
                  readOnly={false}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Input
                  value={address.ward}
                  onChange={(e) => setAddress({ ...address, ward: e.target.value })}
                  placeholder="Ward"
                  className="focus:ring-civilink-blue"
                />
              </div>
              <div className="col-span-2">
                <Input
                  value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  placeholder="Landmark"
                  className="focus:ring-civilink-blue"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Input
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="focus:ring-civilink-blue"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Input
                  value={address.panchayat}
                  onChange={(e) => setAddress({ ...address, panchayat: e.target.value })}
                  placeholder="Panchayat"
                  className="focus:ring-civilink-blue"
                />
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-civilink-blue hover:bg-civilink-darkBlue text-white shadow-button transition-all duration-300 hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </div>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="border-civilink-blue text-civilink-blue hover:bg-civilink-lightBlue transition-colors"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
